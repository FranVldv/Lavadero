import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TurnoDocument = HydratedDocument<Turno>;

export enum Franja {
  MANANA = 'manana', // 08:00 - 12:00
  TARDE = 'tarde',   // 16:00 - 20:00
}

export enum EstadoTurno {
  RESERVADO = 'reservado',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

@Schema({ timestamps: true })
export class Turno {
  // Fecha sin hora — se normaliza a medianoche UTC
  @Prop({ required: true, type: Date })
  fecha: Date;

  @Prop({ required: true, enum: Franja })
  franja: Franja;

  @Prop({ required: true, default: EstadoTurno.RESERVADO, enum: EstadoTurno })
  estado: EstadoTurno;

  // Datos del cliente que reserva (puede no tener registro en BD)
  @Prop({ required: true, trim: true })
  nombreCliente: string;

  @Prop({ required: true, trim: true })
  telefonoCliente: string;

  // Patente del auto
  @Prop({ required: true, uppercase: true, trim: true })
  patente: string;

  // Referencia al servicio elegido
  @Prop({ type: Types.ObjectId, ref: 'Servicio' })
  servicio: Types.ObjectId;

  @Prop({ trim: true })
  notas?: string;
}

export const TurnoSchema = SchemaFactory.createForClass(Turno);

// Índice único: no puede haber dos turnos en la misma fecha y franja
TurnoSchema.index(
  { fecha: 1, franja: 1 },
  {
    unique: true,
    partialFilterExpression: { estado: { $in: ['reservado', 'completado'] } },
  },
);
