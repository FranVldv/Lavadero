import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // Resumen de un mes específico: /reportes/mensual?anio=2025&mes=6
  @Get('mensual')
  mensual(@Query('anio') anio?: string, @Query('mes') mes?: string) {
    return this.reportesService.resumenMensual(
      anio ? Number(anio) : undefined,
      mes ? Number(mes) : undefined,
    );
  }

  // Resumen de todo un año: /reportes/anual?anio=2025
  @Get('anual')
  anual(@Query('anio') anio?: string) {
    return this.reportesService.resumenAnual(anio ? Number(anio) : undefined);
  }

  // Últimos N meses para el gráfico del dashboard
  @Get('tendencia')
  tendencia(@Query('meses') meses?: string) {
    return this.reportesService.tendenciaUltimosMeses(meses ? Number(meses) : 6);
  }
}
