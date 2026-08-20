import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Turno, TurnoDocument, Franja, EstadoTurno } from './schemas/turno.schema';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

const FRANJAS_INFO = {
  [Franja.MANANA]: { label: 'Mañana', horario: '08:00 - 12:00' },
  [Franja.TARDE]:  { label: 'Tarde',  horario: '16:00 - 20:00' },
};

@Injectable()
export class TurnosService {
  constructor(
    @InjectModel(Turno.name) private turnoModel: Model<TurnoDocument>,
    private notificacionesService: NotificacionesService,
  ) {}

  private normalizarFecha(fechaStr: string): Date {
    // Normaliza a medianoche UTC para que la comparación sea consistente
    const d = new Date(fechaStr);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private esDiaHabil(fecha: Date): boolean {
    const dia = fecha.getUTCDay(); // 0=Dom, 1=Lun..., 5=Vie, 6=Sáb
    return dia >= 1 && dia <= 5;
  }

  async getDisponibilidadSemana(fechaReferencia: string) {
    const inicio = this.normalizarFecha(fechaReferencia);
    // Ajusta al lunes de esa semana
    const diaSemana = inicio.getUTCDay();
    const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    inicio.setUTCDate(inicio.getUTCDate() + diffLunes);

    const fin = new Date(inicio);
    fin.setUTCDate(fin.getUTCDate() + 5); // hasta el viernes

    const turnosExistentes = await this.turnoModel
      .find({
        fecha: { $gte: inicio, $lt: fin },
        estado: { $in: [EstadoTurno.RESERVADO, EstadoTurno.COMPLETADO] },
      })
      .lean()
      .exec();

    const dias: any[] = [];
    for (let i = 0; i < 5; i++) {
      const dia = new Date(inicio);
      dia.setUTCDate(dia.getUTCDate() + i);
      const franjas = Object.values(Franja).map((f) => {
        const ocupado = turnosExistentes.some(
          (t) =>
            t.fecha.getTime() === dia.getTime() && t.franja === f,
        );
        return {
          franja: f,
          ...FRANJAS_INFO[f],
          disponible: !ocupado,
        };
      });
      dias.push({
        fecha: dia.toISOString().split('T')[0],
        diaNombre: dia.toLocaleDateString('es-AR', { weekday: 'long', timeZone: 'UTC' }),
        franjas,
      });
    }
    return dias;
  }

  async reservar(dto: CreateTurnoDto) {
    const fecha = this.normalizarFecha(dto.fecha);

    if (!this.esDiaHabil(fecha)) {
      throw new BadRequestException('Solo se aceptan turnos de lunes a viernes');
    }

    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0);
    if (fecha < hoy) {
      throw new BadRequestException('No se pueden reservar turnos en fechas pasadas');
    }

    const turno = await this.turnoModel.create({
      ...dto,
      fecha,
      patente: dto.patente.toUpperCase(),
      estado: EstadoTurno.RESERVADO,
    });

    // Notificación al dueño — fire and forget
    this.notificacionesService
      .notificarNuevoTurno({
        nombreCliente: dto.nombreCliente,
        telefono: dto.telefonoCliente,
        patente: dto.patente.toUpperCase(),
        fecha: fecha.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
        franja: FRANJAS_INFO[dto.franja].horario,
      })
      .catch(() => {}); // no bloquea la respuesta si falla la notificación

    return turno;
  }

  findAll(desde?: string, hasta?: string) {
    const filtro: any = {};
    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = this.normalizarFecha(desde);
      if (hasta) {
        const h = this.normalizarFecha(hasta);
        h.setUTCDate(h.getUTCDate() + 1);
        filtro.fecha.$lt = h;
      }
    }
    return this.turnoModel
      .find(filtro)
      .populate('servicio', 'nombre precio')
      .sort({ fecha: 1, franja: 1 })
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const t = await this.turnoModel
      .findById(id)
      .populate('servicio', 'nombre precio')
      .lean()
      .exec();
    if (!t) throw new NotFoundException(`Turno ${id} no encontrado`);
    return t;
  }

  async update(id: string, dto: UpdateTurnoDto) {
    const t = await this.turnoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!t) throw new NotFoundException(`Turno ${id} no encontrado`);
    return t;
  }
}
