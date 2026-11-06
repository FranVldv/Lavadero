import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class CierreCajaDto {
  @IsNumber()
  @Type(() => Number)
  efectivoRealContado: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get('hoy')
  obtenerEstadoHoy() {
    return this.cajaService.obtenerEstadoHoy();
  }

  @Post('gasto')
  registrarGasto(@Body() dto: CreateGastoDto) {
    return this.cajaService.registrarGasto(dto);
  }

  @Post('cierre')
  cerrarCaja(@Body() dto: CierreCajaDto) {
    return this.cajaService.cerrarCaja(dto.efectivoRealContado, dto.observaciones);
  }

  @Get('historial')
  obtenerHistorial() {
    return this.cajaService.obtenerHistorialCierres();
  }
}
