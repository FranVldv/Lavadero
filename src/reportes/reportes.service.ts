import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Orden, OrdenDocument, EstadoOrden } from '../ordenes/schemas/orden.schema';

@Injectable()
export class ReportesService {
  constructor(
    @InjectModel(Orden.name) private ordenModel: Model<OrdenDocument>,
  ) {}

  async resumenMensual(anio?: number, mes?: number) {
    const hoy = new Date();
    const y = anio ?? hoy.getFullYear();
    const m = mes ?? hoy.getMonth() + 1;

    const inicio = new Date(Date.UTC(y, m - 1, 1));
    const fin    = new Date(Date.UTC(y, m, 1));

    const [autos, ingresos, productos] = await Promise.all([
      this.autosLavadosMes(inicio, fin),
      this.ingresosMes(inicio, fin),
      this.productosUsadosMes(inicio, fin),
    ]);

    return { anio: y, mes: m, autos, ingresos, productos };
  }

  async resumenAnual(anio?: number) {
    const y = anio ?? new Date().getFullYear();
    const meses = await Promise.all(
      Array.from({ length: 12 }, (_, i) => this.resumenMensual(y, i + 1)),
    );
    return { anio: y, meses };
  }

  private async autosLavadosMes(inicio: Date, fin: Date): Promise<number> {
    const result = await this.ordenModel.countDocuments({
      estado: EstadoOrden.COMPLETADA,
      fechaCompletada: { $gte: inicio, $lt: fin },
    });
    return result;
  }

  private async ingresosMes(inicio: Date, fin: Date): Promise<number> {
    const result = await this.ordenModel.aggregate([
      {
        $match: {
          estado: EstadoOrden.COMPLETADA,
          fechaCompletada: { $gte: inicio, $lt: fin },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  private async productosUsadosMes(inicio: Date, fin: Date) {
    return this.ordenModel.aggregate([
      {
        $match: {
          estado: EstadoOrden.COMPLETADA,
          fechaCompletada: { $gte: inicio, $lt: fin },
        },
      },
      { $unwind: '$productosUsados' },
      {
        $group: {
          _id: '$productosUsados.producto',
          totalCantidad: { $sum: '$productosUsados.cantidad' },
        },
      },
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'info',
        },
      },
      { $unwind: { path: '$info', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          nombre: '$info.nombre',
          unidad: '$info.unidad',
          totalCantidad: 1,
        },
      },
      { $sort: { totalCantidad: -1 } },
    ]);
  }

  // Dashboard: últimos 6 meses para el gráfico de tendencia
  async tendenciaUltimosMeses(cantidad = 6) {
    const hoy = new Date();
    const meses = await Promise.all(
      Array.from({ length: cantidad }, (_, i) => {
        const d = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth() - i, 1));
        return this.resumenMensual(d.getFullYear(), d.getMonth() + 1);
      }),
    );
    return meses.reverse();
  }
}
