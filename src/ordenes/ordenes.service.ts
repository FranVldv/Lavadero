import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Orden, OrdenDocument, EstadoOrden, EtapaLavado } from './schemas/orden.schema';
import { TurnosService } from '../turnos/turnos.service';
import { ProductosService } from '../productos/productos.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EstadoTurno } from '../turnos/schemas/turno.schema';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectModel(Orden.name) private ordenModel: Model<OrdenDocument>,
    private turnosService: TurnosService,
    private productosService: ProductosService,
    private notificacionesService: NotificacionesService,
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

  async avanzarEtapa(id: string, nuevaEtapa: EtapaLavado) {
    const orden = await this.ordenModel.findById(id).populate('servicio').exec();
    if (!orden) throw new NotFoundException(`Orden ${id} no encontrada`);

    orden.etapa = nuevaEtapa;

    if (nuevaEtapa === EtapaLavado.TERMINADO) {
      orden.estado = EstadoOrden.COMPLETADA;
      orden.fechaCompletada = new Date();

      // Descuento predictivo automático de stock por categoría de vehículo
      await this.productosService.descontarConsumoPorCategoria(orden.categoriaVehiculo || 'auto');

      // Marcar turno si existía
      if (orden.turno) {
        await this.turnosService.update(orden.turno.toString(), {
          estado: EstadoTurno.COMPLETADO,
        }).catch(() => null);
      }

      // Notificar cliente vía WhatsApp
      if (orden.telefonoCliente) {
        await this.notificacionesService.notificarAutoListo({
          telefono: orden.telefonoCliente,
          nombreCliente: orden.nombreCliente || '',
          patente: orden.patente,
          total: orden.total,
        });
      }
    }

    return orden.save();
  }

  async findByPatentePublico(patente: string) {
    const p = patente.toUpperCase().trim();
    const orden = await this.ordenModel
      .findOne({ patente: p })
      .sort({ createdAt: -1 })
      .populate('servicio', 'nombre precio')
      .lean()
      .exec();

    if (!orden) throw new NotFoundException(`No se encontró ningún vehículo con patente ${p}`);
    return {
      patente: orden.patente,
      nombreCliente: orden.nombreCliente,
      box: orden.box,
      etapa: orden.etapa,
      estado: orden.estado,
      servicio: (orden.servicio as any)?.nombre || 'Lavado Estándar',
      total: orden.total,
      iniciadoAt: orden.iniciadoAt || (orden as any).createdAt,
      tiempoEstimadoMinutos: orden.tiempoEstimadoMinutos || 45,
    };
  }

  async completar(id: string, dto: UpdateOrdenDto) {
    const orden = await this.ordenModel.findById(id).exec();
    if (!orden) throw new NotFoundException(`Orden ${id} no encontrada`);

    Object.assign(orden, dto);

    if (dto.estado === EstadoOrden.COMPLETADA) {
      orden.fechaCompletada = new Date();
      orden.etapa = EtapaLavado.TERMINADO;

      // Descontar stock de cada producto usado si se especificó
      if (dto.productosUsados?.length) {
        await Promise.all(
          dto.productosUsados.map((pu) =>
            this.productosService.ajustarStock(pu.producto.toString(), -pu.cantidad),
          ),
        );
      } else {
        // Descuento predictivo por categoría
        await this.productosService.descontarConsumoPorCategoria(orden.categoriaVehiculo || 'auto');
      }

      // Marcar el turno como completado si existe
      if (orden.turno) {
        await this.turnosService.update(orden.turno.toString(), {
          estado: EstadoTurno.COMPLETADO,
        }).catch(() => null);
      }

      // Notificar por WhatsApp
      if (orden.telefonoCliente) {
        await this.notificacionesService.notificarAutoListo({
          telefono: orden.telefonoCliente,
          nombreCliente: orden.nombreCliente || '',
          patente: orden.patente,
          total: orden.total,
        });
      }
    }

    return orden.save();
  }
}
