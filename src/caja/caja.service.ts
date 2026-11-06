import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MovimientoCaja, MovimientoCajaDocument, TipoMovimiento, MetodoCobro } from './schemas/movimiento-caja.schema';
import { CierreCaja, CierreCajaDocument } from './schemas/cierre-caja.schema';
import { Orden, OrdenDocument, EstadoOrden, MetodoPago } from '../ordenes/schemas/orden.schema';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateGastoDto } from './dto/create-gasto.dto';

@Injectable()
export class CajaService {
  constructor(
    @InjectModel(MovimientoCaja.name) private movimientoModel: Model<MovimientoCajaDocument>,
    @InjectModel(CierreCaja.name) private cierreModel: Model<CierreCajaDocument>,
    @InjectModel(Orden.name) private ordenModel: Model<OrdenDocument>,
    private notificacionesService: NotificacionesService,
  ) {}

  private getRangoHoy() {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    return { inicio, fin };
  }

  async registrarGasto(dto: CreateGastoDto) {
    const mov = await this.movimientoModel.create({
      tipo: TipoMovimiento.EGRESO,
      metodo: dto.metodo || MetodoCobro.EFECTIVO,
      monto: dto.monto,
      concepto: dto.concepto,
      categoria: dto.categoria,
    });
    return mov;
  }

  async obtenerEstadoHoy() {
    const { inicio, fin } = this.getRangoHoy();

    // 1. Órdenes completadas hoy
    const ordenesHoy = await this.ordenModel.find({
      estado: EstadoOrden.COMPLETADA,
      updatedAt: { $gte: inicio, $lte: fin },
    }).lean().exec();

    let ingresosEfectivo = 0;
    let ingresosTransferencia = 0;

    for (const ord of ordenesHoy) {
      if (ord.metodoPago === MetodoPago.TRANSFERENCIA) {
        ingresosTransferencia += ord.total;
      } else {
        ingresosEfectivo += ord.total;
      }
    }

    // 2. Gastos de hoy
    const gastosHoy = await this.movimientoModel.find({
      tipo: TipoMovimiento.EGRESO,
      createdAt: { $gte: inicio, $lte: fin },
    }).sort({ createdAt: -1 }).lean().exec();

    const totalGastosEfectivo = gastosHoy
      .filter((g) => g.metodo === MetodoCobro.EFECTIVO)
      .reduce((acc, g) => acc + g.monto, 0);

    const totalGastosOtros = gastosHoy
      .filter((g) => g.metodo !== MetodoCobro.EFECTIVO)
      .reduce((acc, g) => acc + g.monto, 0);

    const totalGastos = totalGastosEfectivo + totalGastosOtros;
    const efectivoEsperadoEnCaja = Math.max(0, ingresosEfectivo - totalGastosEfectivo);
    const recaudacionTotalBruta = ingresosEfectivo + ingresosTransferencia;
    const gananciaNetaEstimada = recaudacionTotalBruta - totalGastos;

    return {
      fecha: new Date().toISOString().split('T')[0],
      autosLavados: ordenesHoy.length,
      ingresosEfectivo,
      ingresosTransferencia,
      recaudacionTotalBruta,
      totalGastos,
      totalGastosEfectivo,
      efectivoEsperadoEnCaja,
      gananciaNetaEstimada,
      gastos: gastosHoy,
    };
  }

  async cerrarCaja(efectivoRealContado: number, observaciones?: string) {
    const estado = await this.obtenerEstadoHoy();
    const diferencia = efectivoRealContado - estado.efectivoEsperadoEnCaja;

    const cierre = await this.cierreModel.create({
      fecha: estado.fecha,
      totalEfectivo: estado.ingresosEfectivo,
      totalTransferencias: estado.ingresosTransferencia,
      totalGastos: estado.totalGastos,
      gananciaNetaEstimada: estado.gananciaNetaEstimada,
      autosLavados: estado.autosLavados,
      efectivoRealContado,
      diferenciaCaja: diferencia,
      observaciones,
    });

    // Formatear texto para WhatsApp
    const diffTexto = diferencia >= 0 ? `+$${diferencia.toLocaleString('es-AR')} (Exacto o sobrante)` : `-$${Math.abs(diferencia).toLocaleString('es-AR')} (Faltante)`;
    const textoWhatsApp =
      `📊 *CIERRE DIARIO - LAVADERO* 🚗\n` +
      `📅 Fecha: ${estado.fecha}\n` +
      `🚘 *Autos lavados:* ${estado.autosLavados}\n\n` +
      `💵 *Efectivo cobrado:* $${estado.ingresosEfectivo.toLocaleString('es-AR')}\n` +
      `📱 *Transferencias / MP:* $${estado.ingresosTransferencia.toLocaleString('es-AR')}\n` +
      `💸 *Gastos caja chica:* -$${estado.totalGastos.toLocaleString('es-AR')}\n` +
      `────────────────────────\n` +
      `💰 *FACTURACIÓN BRUTA:* $${estado.recaudacionTotalBruta.toLocaleString('es-AR')}\n` +
      `💵 *EFECTIVO FÍSICO ARQUEO:* $${efectivoRealContado.toLocaleString('es-AR')} (${diffTexto})\n` +
      `✅ *GANANCIA NETA ESTIMADA:* $${estado.gananciaNetaEstimada.toLocaleString('es-AR')}\n\n` +
      `_Cierre registrado exitosamente desde el Asistente._`;

    // Enviar WhatsApp al dueño
    await this.notificacionesService.notificarCierreDiario(textoWhatsApp);

    return {
      cierre,
      resumenWhatsApp: textoWhatsApp,
    };
  }

  async obtenerHistorialCierres() {
    return this.cierreModel.find().sort({ createdAt: -1 }).limit(30).lean().exec();
  }
}
