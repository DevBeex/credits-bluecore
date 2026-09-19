import { HttpErrorResponse } from '@angular/common/http';
import { readApiError } from './read-api-error';

function httpError(error: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status: 400, error, statusText: 'Bad Request' });
}

describe('readApiError', () => {
  it('joins details when the API sends field errors', () => {
    expect(
      readApiError(
        httpError({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Datos inválidos',
          details: ['El monto mínimo es 500', 'El plazo mínimo es 6 meses'],
        }),
      ),
    ).toBe('El monto mínimo es 500. El plazo mínimo es 6 meses');
  });

  it('uses the API message when there are no details', () => {
    expect(
      readApiError(
        httpError({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Credenciales inválidas',
        }),
      ),
    ).toBe('Credenciales inválidas');
  });

  it('falls back when the body is not an API error', () => {
    expect(readApiError(httpError(null))).toBe('Ocurrió un error inesperado');
  });
});
