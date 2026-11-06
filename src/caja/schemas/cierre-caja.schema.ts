import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CierreCajaDocument = HydratedDocument<CierreCaja>;

@Schema({ timestamps: true })
export class CierreCaja {
  @Prop({ required: true })
  fecha: string; // "YYYY-MM-DD"

  @Prop({ default: 0 })
  totalEfectivo: number;

  @Prop({ default: 0 })
  totalTransferencias: number;

  @Prop({ default: 0 })
  totalGastos: number;

  @Prop({ default: 0 })
  gananciaNetaEstimada: number;

  @Prop({ default: 0 })
  autosLavados: number;

  @Prop({ default: 0 })
  efectivoRealContado: number;

  @Prop({ default: 0 })
  diferenciaCaja: number; // real - esperado

  @Prop({ trim: true })
  observaciones?: string;
}

export const CierreCajaSchema = SchemaFactory.createForClass(CierreCaja);
