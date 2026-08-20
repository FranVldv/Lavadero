import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehiculo, VehiculoDocument } from './schemas/vehiculo.schema';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectModel(Vehiculo.name) private vehiculoModel: Model<VehiculoDocument>,
  ) {}

  create(dto: CreateVehiculoDto) {
    return this.vehiculoModel.create(dto);
  }

  findAll() {
    return this.vehiculoModel.find().populate('cliente', 'nombre telefono').lean().exec();
  }

  findByCliente(clienteId: string) {
    return this.vehiculoModel.find({ cliente: clienteId }).lean().exec();
  }

  findByPatente(patente: string) {
    return this.vehiculoModel
      .findOne({ patente: patente.toUpperCase() })
      .populate('cliente', 'nombre telefono')
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const v = await this.vehiculoModel.findById(id).populate('cliente', 'nombre telefono').lean().exec();
    if (!v) throw new NotFoundException(`Vehículo ${id} no encontrado`);
    return v;
  }

  async update(id: string, dto: UpdateVehiculoDto) {
    const v = await this.vehiculoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!v) throw new NotFoundException(`Vehículo ${id} no encontrado`);
    return v;
  }

  async remove(id: string) {
    const v = await this.vehiculoModel.findByIdAndDelete(id).exec();
    if (!v) throw new NotFoundException(`Vehículo ${id} no encontrado`);
    return { message: `Vehículo eliminado` };
  }
}
