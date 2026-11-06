import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { Orden, OrdenSchema } from './schemas/orden.schema';
import { TurnosModule } from '../turnos/turnos.module';
import { ProductosModule } from '../productos/productos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Orden.name, schema: OrdenSchema }]),
    TurnosModule,
    ProductosModule,
    NotificacionesModule,
  ],
  controllers: [OrdenesController],
  providers: [OrdenesService],
  exports: [OrdenesService],
})
export class OrdenesModule {}
