import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClienteDocument = HydratedDocument<Cliente>;

@Schema({ timestamps: true }) // agrega createdAt y updatedAt automáticamente
export class Cliente {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, unique: true, trim: true })
  telefono: string;

  @Prop({ trim: true })
  email?: string;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
