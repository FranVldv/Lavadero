import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Orden, OrdenSchema } from '../ordenes/schemas/orden.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Orden.name, schema: OrdenSchema }])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
