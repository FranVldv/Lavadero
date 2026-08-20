import {
  IsMongoId,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '../schemas/orden.schema';

class ProductoUsadoDto {
  @IsMongoId()
  producto: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cantidad: number;
}

export class CreateOrdenDto {
  @IsMongoId()
  turno: string;

  @IsString()
  @IsNotEmpty()
  patente: string;

  @IsMongoId()
  servicio: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoUsadoDto)
  @IsOptional()
  productosUsados?: ProductoUsadoDto[];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  total: number;

  @IsEnum(MetodoPago)
  @IsOptional()
  metodoPago?: MetodoPago;

  @IsString()
  @IsOptional()
  notas?: string;
}
