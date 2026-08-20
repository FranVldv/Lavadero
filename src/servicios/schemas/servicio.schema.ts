import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServicioDocument = HydratedDocument<Servicio>;

@Schema({ timestamps: true })
export class Servicio {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, min: 0 })
  precio: number;

  @Prop({ trim: true })
  descripcion?: string;

  @Prop({ default: true })
  activo: boolean;
}

export const ServicioSchema = SchemaFactory.createForClass(Servicio);
