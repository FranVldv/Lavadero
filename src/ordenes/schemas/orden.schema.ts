import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrdenDocument = HydratedDocument<Orden>;

export enum EstadoOrden {
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  TARJETA = 'tarjeta',
}

export enum EtapaLavado {
  INGRESADO = 'ingresado',
  LAVADO = 'lavado',
  SECADO = 'secado',
  TERMINADO = 'terminado',
}

export enum CategoriaVehiculo {
  AUTO = 'auto',
  SUV = 'suv',
  CAMIONETA = 'camioneta',
}

class ProductoUsado {
  @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
  producto: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  cantidad: number;
}

@Schema({ timestamps: true })
export class Orden {
  @Prop({ type: Types.ObjectId, ref: 'Turno', required: false })
  turno?: Types.ObjectId;

  @Prop({ required: true, uppercase: true, trim: true })
  patente: string;

  @Prop({ trim: true })
  nombreCliente?: string;

  @Prop({ trim: true })
  telefonoCliente?: string;

  @Prop({ trim: true, default: 'Box 1' })
  box: string; // "Box 1", "Box 2", "Box 3"

  @Prop({ enum: EtapaLavado, default: EtapaLavado.INGRESADO })
  etapa: EtapaLavado;

  @Prop({ enum: CategoriaVehiculo, default: CategoriaVehiculo.AUTO })
  categoriaVehiculo: CategoriaVehiculo;

  @Prop({ type: Types.ObjectId, ref: 'Servicio', required: true })
  servicio: Types.ObjectId;

  @Prop({ type: [ProductoUsado], default: [] })
  productosUsados: ProductoUsado[];

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ enum: MetodoPago, default: MetodoPago.EFECTIVO })
  metodoPago: MetodoPago;

  @Prop({ enum: EstadoOrden, default: EstadoOrden.EN_PROCESO })
  estado: EstadoOrden;

  @Prop({ default: 45 })
  tiempoEstimadoMinutos: number;

  @Prop({ type: Date, default: Date.now })
  iniciadoAt: Date;

  @Prop({ type: Date })
  fechaCompletada?: Date;

  @Prop({ trim: true })
  notas?: string;
}

export const OrdenSchema = SchemaFactory.createForClass(Orden);
