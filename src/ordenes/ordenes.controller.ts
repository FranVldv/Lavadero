import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EtapaLavado } from './schemas/orden.schema';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  // Endpoint público: cualquier cliente consulta el estado de su vehículo por patente
  @Get('tracking/:patente')
  tracking(@Param('patente') patente: string) {
    return this.ordenesService.findByPatentePublico(patente);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOrdenDto) {
    return this.ordenesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.ordenesService.findAll(desde, hasta);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesService.findOne(id);
  }

  // Avanza de etapa: 'ingresado' -> 'lavado' -> 'secado' -> 'terminado' (notifica automáticamente por WhatsApp)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/etapa')
  avanzarEtapa(@Param('id') id: string, @Body('etapa') etapa: EtapaLavado) {
    return this.ordenesService.avanzarEtapa(id, etapa);
  }

  // El dueño usa este endpoint para registrar los productos usados y marcar como completada
  @UseGuards(JwtAuthGuard)
  @Patch(':id/completar')
  completar(@Param('id') id: string, @Body() dto: UpdateOrdenDto) {
    return this.ordenesService.completar(id, dto);
  }
}
