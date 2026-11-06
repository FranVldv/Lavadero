import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductoDocument = HydratedDocument<Producto>;

@Schema({ timestamps: true })
export class Producto {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ trim: true, default: 'unidad' })
  unidad: string;

  @Prop({ default: 0, min: 0 })
  stockActual: number;

  @Prop({ default: 0.1, min: 0 })
  consumoBasePorLavado: number; // Ej: 0.1L para auto base

  @Prop({ default: 2, min: 0 })
  stockMinimo: number; // Umbral de alerta
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);
