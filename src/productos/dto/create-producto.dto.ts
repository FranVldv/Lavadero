import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  unidad?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockActual?: number;
}
