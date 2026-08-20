import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioModel.findOne({ email: dto.email }).exec();
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const match = await bcrypt.compare(dto.password, usuario.password);
    if (!match) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.jwtService.sign({
      sub: usuario._id,
      email: usuario.email,
      role: usuario.role,
    });

    return { access_token: token, nombre: usuario.nombre, role: usuario.role };
  }

  // Endpoint de configuración inicial — solo funciona si no existe ningún admin
  async setup(dto: CreateUsuarioDto) {
    const total = await this.usuarioModel.countDocuments().exec();
    if (total > 0) {
      throw new BadRequestException('El sistema ya fue configurado');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const usuario = await this.usuarioModel.create({
      ...dto,
      password: hashed,
      role: 'admin',
    });

    return { message: 'Admin creado correctamente', email: usuario.email };
  }

  async cambiarPassword(userId: string, passwordActual: string, passwordNueva: string) {
    const usuario = await this.usuarioModel.findById(userId).exec();
    if (!usuario) throw new UnauthorizedException();

    const match = await bcrypt.compare(passwordActual, usuario.password);
    if (!match) throw new UnauthorizedException('Contraseña actual incorrecta');

    if (passwordNueva.length < 6) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 6 caracteres');
    }

    usuario.password = await bcrypt.hash(passwordNueva, 10);
    await usuario.save();
    return { message: 'Contraseña actualizada' };
  }
}
