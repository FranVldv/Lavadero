import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajaController } from './caja.controller';
import { CajaService } from './caja.service';
import { MovimientoCaja, MovimientoCajaSchema } from './schemas/movimiento-caja.schema';
import { CierreCaja, CierreCajaSchema } from './schemas/cierre-caja.schema';
import { Orden, OrdenSchema } from '../ordenes/schemas/orden.schema';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MovimientoCaja.name, schema: MovimientoCajaSchema },
      { name: CierreCaja.name, schema: CierreCajaSchema },
      { name: Orden.name, schema: OrdenSchema },
    ]),
    NotificacionesModule,
  ],
  controllers: [CajaController],
  providers: [CajaService],
  exports: [CajaService],
})
export class CajaModule {}
