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

  async remove(id: string) {
    const p = await this.productoModel.findByIdAndDelete(id).exec();
    if (!p) throw new NotFoundException(`Producto ${id} no encontrado`);
    return { message: `Producto eliminado` };
  }
}
