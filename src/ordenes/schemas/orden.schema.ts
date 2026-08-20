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

class ProductoUsado {
  @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
  producto: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  cantidad: number;
}

@Schema({ timestamps: true })
export class Orden {
  @Prop({ type: Types.ObjectId, ref: 'Turno', required: true, unique: true })
  turno: Types.ObjectId;

  @Prop({ required: true, uppercase: true, trim: true })
  patente: string;

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

  @Prop({ type: Date })
  fechaCompletada?: Date;

  @Prop({ trim: true })
  notas?: string;
}

export const OrdenSchema = SchemaFactory.createForClass(Orden);
