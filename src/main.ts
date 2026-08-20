import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar Helmet para cabeceras HTTP seguras (protege contra XSS, Clickjacking, etc.)
  app.use(helmet());

  app.setGlobalPrefix('api/v1');

  // CORS — el frontend React se conecta desde otro puerto en desarrollo
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚗 Lavadero API corriendo en: http://localhost:${port}/api/v1`);
}

bootstrap();
