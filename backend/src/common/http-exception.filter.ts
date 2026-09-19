import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import type { ApiErrorBody } from './api-error';

const HTTP_ERROR_NAME: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const body = this.toBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ApiErrorBody {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof QueryFailedError) {
      return this.fromDatabaseError(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: HTTP_ERROR_NAME[HttpStatus.INTERNAL_SERVER_ERROR],
      message: 'Ocurrió un error inesperado',
    };
  }

  private fromHttpException(exception: HttpException): ApiErrorBody {
    const statusCode = exception.getStatus();
    const error = HTTP_ERROR_NAME[statusCode] ?? exception.name;
    const raw = exception.getResponse();

    if (typeof raw === 'string') {
      return { statusCode, error, message: raw };
    }

    const payload = raw as { message?: string | string[] };
    const details = Array.isArray(payload.message)
      ? payload.message
      : undefined;
    const message = Array.isArray(payload.message)
      ? 'Hay datos inválidos'
      : (payload.message ?? exception.message);

    return details ? { statusCode, error, message, details } : { statusCode, error, message };
  }

  private fromDatabaseError(exception: QueryFailedError): ApiErrorBody {
    const code = (exception.driverError as { code?: string } | undefined)?.code;

    if (code === '23514') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: HTTP_ERROR_NAME[HttpStatus.BAD_REQUEST],
        message: 'Los datos no cumplen las reglas de negocio',
      };
    }

    if (code === '23505') {
      return {
        statusCode: HttpStatus.CONFLICT,
        error: HTTP_ERROR_NAME[HttpStatus.CONFLICT],
        message: 'El recurso ya existe',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: HTTP_ERROR_NAME[HttpStatus.INTERNAL_SERVER_ERROR],
      message: 'Ocurrió un error inesperado',
    };
  }
}