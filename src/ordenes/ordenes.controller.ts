import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  create(@Body() dto: CreateOrdenDto) {
    return this.ordenesService.create(dto);
  }

  @Get()
  findAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.ordenesService.findAll(desde, hasta);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesService.findOne(id);
  }

  // El dueño usa este endpoint para registrar los productos usados y marcar como completada
  @Patch(':id/completar')
  completar(@Param('id') id: string, @Body() dto: UpdateOrdenDto) {
    return this.ordenesService.completar(id, dto);
  }
}
