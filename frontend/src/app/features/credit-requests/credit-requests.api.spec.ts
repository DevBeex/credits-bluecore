import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CreditRequestsApi } from './credit-requests.api';

const url = `${environment.apiUrl}/credit-requests`;

describe('CreditRequestsApi', () => {
  let api: CreditRequestsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(CreditRequestsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lists with pagination and omits status when showing all', () => {
    api.list({ page: 2, limit: 10 }).subscribe();

    const request = http.expectOne(
      (pending) => pending.url === url && pending.method === 'GET',
    );
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.has('status')).toBe(false);
    request.flush({ data: [], meta: { page: 2, limit: 10, total: 0, totalPages: 1 } });
  });

  it('sends the status filter when one is selected', () => {
    api.list({ status: 'PENDING', page: 1, limit: 10 }).subscribe();

    const request = http.expectOne(
      (pending) => pending.url === url && pending.method === 'GET',
    );
    expect(request.request.params.get('status')).toBe('PENDING');
    request.flush({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  });

  it('creates a request with the payload from the form', () => {
    const payload = {
      applicantDocument: '8-123-456',
      amount: 1500,
      termMonths: 12,
    };
    api.create(payload).subscribe();

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 'req-1', ...payload });
  });

  it('patches status with comment', () => {
    api
      .updateStatus('req-1', { status: 'APPROVED', comment: 'Cumple política' })
      .subscribe();

    const request = http.expectOne(`${url}/req-1/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      status: 'APPROVED',
      comment: 'Cumple política',
    });
    request.flush({ id: 'req-1', status: 'APPROVED' });
  });
});
