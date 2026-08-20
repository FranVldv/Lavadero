import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { Franja } from '../schemas/turno.schema';

export class CreateTurnoDto {
  @IsDateString()
  fecha: string; // formato ISO: "2025-06-10"

  @IsEnum(Franja)
  franja: Franja;

  @IsString()
  @IsNotEmpty()
  nombreCliente: string;

  @IsString()
  @IsNotEmpty()
  telefonoCliente: string;

  @IsString()
  @IsNotEmpty()
  patente: string;

  @IsMongoId()
  @IsOptional()
  servicio?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
