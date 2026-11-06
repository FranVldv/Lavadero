import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoriaGasto, MetodoCobro } from '../schemas/movimiento-caja.schema';

export class CreateGastoDto {
  @IsString()
  @IsNotEmpty()
  concepto: string;

  @IsNumber()
  @Type(() => Number)
  monto: number;

  @IsEnum(MetodoCobro)
  @IsOptional()
  metodo?: MetodoCobro = MetodoCobro.EFECTIVO;

  @IsEnum(CategoriaGasto)
  @IsOptional()
  categoria?: CategoriaGasto = CategoriaGasto.OTRO;
}
