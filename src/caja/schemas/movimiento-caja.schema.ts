import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovimientoCajaDocument = HydratedDocument<MovimientoCaja>;

export enum TipoMovimiento {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

export enum MetodoCobro {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
}

export enum CategoriaGasto {
  ALMUERZO = 'almuerzo',
  INSUMOS = 'insumos',
  REPUESTOS = 'repuestos',
  MANTENIMIENTO = 'mantenimiento',
  RETIRO_DUENO = 'retiro_dueno',
  OTRO = 'otro',
}

@Schema({ timestamps: true })
export class MovimientoCaja {
  @Prop({ required: true, enum: TipoMovimiento })
  tipo: TipoMovimiento;

  @Prop({ required: true, enum: MetodoCobro, default: MetodoCobro.EFECTIVO })
  metodo: MetodoCobro;

  @Prop({ required: true, min: 0 })
  monto: number;

  @Prop({ required: true, trim: true })
  concepto: string;

  @Prop({ enum: CategoriaGasto, default: CategoriaGasto.OTRO })
  categoria: CategoriaGasto;

  @Prop({ type: Date, default: Date.now })
  fecha: Date;
}

export const MovimientoCajaSchema = SchemaFactory.createForClass(MovimientoCaja);
