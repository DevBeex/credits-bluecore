import { HttpErrorResponse } from '@angular/common/http';
import type { ApiErrorBody } from './auth/auth.models';

export function readApiError(error: HttpErrorResponse): string {
  const body = error.error as ApiErrorBody | undefined;
  if (body?.details?.length) {
    return body.details.join('. ');
  }
  return body?.message ?? 'Ocurrió un error inesperado';
}