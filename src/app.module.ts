import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ClientesModule } from './clientes/clientes.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ServiciosModule } from './servicios/servicios.module';
import { ProductosModule } from './productos/productos.module';
import { TurnosModule } from './turnos/turnos.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { AuthModule } from './auth/auth.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lavadero'),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 60,  // máximo 60 peticiones por minuto por IP
    }]),
    AuthModule,
    ClientesModule,
    VehiculosModule,
    ServiciosModule,
    ProductosModule,
    TurnosModule,
    OrdenesModule,
    NotificacionesModule,
    ReportesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
