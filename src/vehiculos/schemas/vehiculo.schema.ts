import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VehiculoDocument = HydratedDocument<Vehiculo>;

@Schema({ timestamps: true })
export class Vehiculo {
  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  cliente: Types.ObjectId;

  @Prop({ required: true, uppercase: true, trim: true })
  patente: string;

  @Prop({ trim: true })
  marca: string;

  @Prop({ trim: true })
  modelo: string;

  @Prop({ trim: true })
  color: string;
}

export const VehiculoSchema = SchemaFactory.createForClass(Vehiculo);
VehiculoSchema.index({ patente: 1 }, { unique: true });
