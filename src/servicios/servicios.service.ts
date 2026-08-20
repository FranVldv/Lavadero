import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Servicio, ServicioDocument } from './schemas/servicio.schema';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectModel(Servicio.name) private servicioModel: Model<ServicioDocument>,
  ) {}

  create(dto: CreateServicioDto) {
    return this.servicioModel.create(dto);
  }

  findAll(soloActivos = false) {
    const filtro = soloActivos ? { activo: true } : {};
    return this.servicioModel.find(filtro).lean().exec();
  }

  async findOne(id: string) {
    const s = await this.servicioModel.findById(id).lean().exec();
    if (!s) throw new NotFoundException(`Servicio ${id} no encontrado`);
    return s;
  }

  async update(id: string, dto: UpdateServicioDto) {
    const s = await this.servicioModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!s) throw new NotFoundException(`Servicio ${id} no encontrado`);
    return s;
  }

  async remove(id: string) {
    const s = await this.servicioModel.findByIdAndDelete(id).exec();
    if (!s) throw new NotFoundException(`Servicio ${id} no encontrado`);
    return { message: `Servicio eliminado` };
  }
}
