import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import type { Request, Response } from 'express';

export function configureHttp(app: INestApplication): void {
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({ origin: true });
}

export function configureNotFoundHandler(app: INestApplication): void {
  const server = app.getHttpAdapter().getInstance();
  server.use((req: Request, res: Response) => {
    if (res.headersSent) {
      return;
    }
    res.status(404).json({
      statusCode: 404,
      error: 'Not Found',
      message: 'La ruta no existe',
    });
  })
}