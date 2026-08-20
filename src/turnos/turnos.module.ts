import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';
import { Turno, TurnoSchema } from './schemas/turno.schema';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Turno.name, schema: TurnoSchema }]),
    NotificacionesModule,
  ],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService],
})
export class TurnosModule {}
