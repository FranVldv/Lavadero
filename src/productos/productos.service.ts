import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Producto, ProductoDocument } from './schemas/producto.schema';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
  ) {}

  create(dto: CreateProductoDto) {
    return this.productoModel.create(dto);
  }

  findAll() {
    return this.productoModel.find().lean().exec();
  }

  async findOne(id: string) {
    const p = await this.productoModel.findById(id).lean().exec();
    if (!p) throw new NotFoundException(`Producto ${id} no encontrado`);
    return p;
  }

  async update(id: string, dto: UpdateProductoDto) {
    const p = await this.productoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!p) throw new NotFoundException(`Producto ${id} no encontrado`);
    return p;
  }

  async ajustarStock(id: string, cantidad: number) {
    const p = await this.productoModel
      .findByIdAndUpdate(id, { $inc: { stockActual: cantidad } }, { new: true })
      .lean()
      .exec();
    if (!p) throw new NotFoundException(`Producto ${id} no encontrado`);
    return p;
  }

  async obtenerPronosticoInsumos() {
    const productos = await this.productoModel.find().lean().exec();

    // Factor promedio de flota ponderada (Hatchback 1.0, SUV 1.3, Camioneta 1.6) -> factor promedio ~1.2
    const factorPromedio = 1.2;

    return productos.map((p) => {
      const consumoEfectivo = (p.consumoBasePorLavado || 0.1) * factorPromedio;
      const lavadosRestantes = consumoEfectivo > 0 ? Math.max(0, Math.floor(p.stockActual / consumoEfectivo)) : 999;
      
      let estado: 'CRITICO' | 'ALERTA' | 'OPTIMO' = 'OPTIMO';
      if (lavadosRestantes <= 10 || p.stockActual <= (p.stockMinimo || 2)) {
        estado = 'CRITICO';
      } else if (lavadosRestantes <= 25) {
        estado = 'ALERTA';
      }

      return {
        _id: p._id,
        nombre: p.nombre,
        unidad: p.unidad,
        stockActual: p.stockActual,
        stockMinimo: p.stockMinimo ?? 2,
        consumoBasePorLavado: p.consumoBasePorLavado ?? 0.1,
        lavadosRestantes,
        estado,
      };
    });
  }

  async descontarConsumoPorCategoria(categoria: 'auto' | 'suv' | 'camioneta' = 'auto') {
    const factores = {
      auto: 1.0,
      suv: 1.3,
      camioneta: 1.6,
    };
    const factor = factores[categoria] ?? 1.0;
    const productos = await this.productoModel.find().exec();

    for (const p of productos) {
      if (p.consumoBasePorLavado && p.consumoBasePorLavado > 0) {
        const deduccion = p.consumoBasePorLavado * factor;
        p.stockActual = Math.max(0, p.stockActual - deduccion);
        await p.save();
      }
    }
  }

  async remove(id: string) {
    const p = await this.productoModel.findByIdAndDelete(id).exec();
    if (!p) throw new NotFoundException(`Producto ${id} no encontrado`);
    return { message: `Producto eliminado` };
  }
}
