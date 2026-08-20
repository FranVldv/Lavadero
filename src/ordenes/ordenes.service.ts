import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Orden, OrdenDocument, EstadoOrden } from './schemas/orden.schema';
import { TurnosService } from '../turnos/turnos.service';
import { ProductosService } from '../productos/productos.service';
import { EstadoTurno } from '../turnos/schemas/turno.schema';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectModel(Orden.name) private ordenModel: Model<OrdenDocument>,
    private turnosService: TurnosService,
    private productosService: ProductosService,
  ) {}

  async create(dto: CreateOrdenDto) {
    const orden = await this.ordenModel.create({
      ...dto,
      patente: dto.patente.toUpperCase(),
    });
    return orden;
  }

  findAll(desde?: string, hasta?: string) {
    const filtro: any = {};
    if (desde || hasta) {
      filtro.createdAt = {};
      if (desde) filtro.createdAt.$gte = new Date(desde);
      if (hasta) filtro.createdAt.$lte = new Date(hasta);
    }
    return this.ordenModel
      .find(filtro)
      .populate('turno', 'fecha franja nombreCliente telefonoCliente')
      .populate('servicio', 'nombre precio')
      .populate('productosUsados.producto', 'nombre unidad')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const o = await this.ordenModel
      .findById(id)
      .populate('turno')
      .populate('servicio', 'nombre precio')
      .populate('productosUsados.producto', 'nombre unidad')
      .lean()
      .exec();
    if (!o) throw new NotFoundException(`Orden ${id} no encontrada`);
    return o;
  }

  async completar(id: string, dto: UpdateOrdenDto) {
    const orden = await this.ordenModel.findById(id).exec();
    if (!orden) throw new NotFoundException(`Orden ${id} no encontrada`);

    Object.assign(orden, dto);

    if (dto.estado === EstadoOrden.COMPLETADA) {
      orden.fechaCompletada = new Date();

      // Descontar stock de cada producto usado
      if (dto.productosUsados?.length) {
        await Promise.all(
          dto.productosUsados.map((pu) =>
            this.productosService.ajustarStock(pu.producto.toString(), -pu.cantidad),
          ),
        );
      }

      // Marcar el turno como completado
      await this.turnosService.update(orden.turno.toString(), {
        estado: EstadoTurno.COMPLETADO,
      });
    }

    return orden.save();
  }
}
