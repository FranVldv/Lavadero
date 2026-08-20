import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoTurno } from '../schemas/turno.schema';

export class UpdateTurnoDto {
  @IsEnum(EstadoTurno)
  @IsOptional()
  estado?: EstadoTurno;

  @IsString()
  @IsOptional()
  notas?: string;
}
