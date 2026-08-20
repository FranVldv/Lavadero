import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cliente, ClienteDocument } from './schemas/cliente.schema';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<ClienteDocument>,
  ) {}

  create(dto: CreateClienteDto) {
    return this.clienteModel.create(dto);
  }

  findAll() {
    return this.clienteModel.find().exec();
  }

  async findOne(id: string) {
    const cliente = await this.clienteModel.findById(id).exec();
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    const cliente = await this.clienteModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  async remove(id: string) {
    const cliente = await this.clienteModel.findByIdAndDelete(id).exec();
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return { message: `Cliente ${id} eliminado` };
  }
}
