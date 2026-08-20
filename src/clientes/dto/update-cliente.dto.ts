import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteDto } from './create-cliente.dto';

// PartialType hace todos los campos opcionales — ideal para PATCH
export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
