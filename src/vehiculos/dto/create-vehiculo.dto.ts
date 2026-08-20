import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreateVehiculoDto {
  @IsMongoId()
  cliente: string;

  @IsString()
  @IsNotEmpty()
  patente: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
