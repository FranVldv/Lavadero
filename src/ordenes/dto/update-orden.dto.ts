import { IsEnum, IsNumber, IsOptional, IsString, IsArray, ValidateNested, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoOrden, MetodoPago } from '../schemas/orden.schema';

class ProductoUsadoDto {
  @IsMongoId()
  producto: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cantidad: number;
}

export class UpdateOrdenDto {
  @IsEnum(EstadoOrden)
  @IsOptional()
  estado?: EstadoOrden;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoUsadoDto)
  @IsOptional()
  productosUsados?: ProductoUsadoDto[];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  total?: number;

  @IsEnum(MetodoPago)
  @IsOptional()
  metodoPago?: MetodoPago;

  @IsString()
  @IsOptional()
  notas?: string;
}
