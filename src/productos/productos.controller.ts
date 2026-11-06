import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class AjustarStockDto {
  @IsNumber()
  @Type(() => Number)
  cantidad: number;
}

@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get('pronostico')
  obtenerPronostico() {
    return this.productosService.obtenerPronosticoInsumos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    return this.productosService.update(id, dto);
  }

  @Patch(':id/stock')
  ajustarStock(@Param('id') id: string, @Body() dto: AjustarStockDto) {
    return this.productosService.ajustarStock(id, dto.cantidad);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
