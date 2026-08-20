import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  // ── Rutas públicas ─────────────────────────────────────────────────────────

  // Disponibilidad de la semana — la página pública la usa para mostrar el calendario
  @Get('semana')
  getDisponibilidadSemana(@Query('fecha') fecha: string) {
    const ref = fecha ?? new Date().toISOString().split('T')[0];
    return this.turnosService.getDisponibilidadSemana(ref);
  }

  // Reserva pública — cualquier persona puede pedir turno
  @Post('reservar')
  reservar(@Body() dto: CreateTurnoDto) {
    return this.turnosService.reservar(dto);
  }

  // ── Rutas protegidas (solo admin) ──────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.turnosService.findAll(desde, hasta);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.turnosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTurnoDto) {
    return this.turnosService.update(id, dto);
  }
}
