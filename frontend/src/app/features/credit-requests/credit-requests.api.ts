import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import type {
  CreditRequest,
  CreditRequestListResponse,
  CreditRequestStatus,
} from './credit-request.models';

export type CreateCreditRequestPayload = {
  applicantDocument: string;
  amount: number;
  termMonths: number;
};

export type UpdateCreditRequestStatusPayload = {
  status: Exclude<CreditRequestStatus, 'PENDING'>;
  comment: string;
};

@Injectable({ providedIn: 'root' })
export class CreditRequestsApi {
  private readonly url = `${environment.apiUrl}/credit-requests`;

  constructor(private readonly http: HttpClient) {}

  list(options: { status?: CreditRequestStatus; page: number; limit: number }) {
    let params = new HttpParams()
      .set('page', String(options.page))
      .set('limit', String(options.limit));

    if (options.status) {
      params = params.set('status', options.status);
    }

    return this.http.get<CreditRequestListResponse>(this.url, { params });
  }

  create(payload: CreateCreditRequestPayload) {
    return this.http.post<CreditRequest>(this.url, payload);
  }

  updateStatus(id: string, payload: UpdateCreditRequestStatusPayload) {
    return this.http.patch<CreditRequest>(`${this.url}/${id}/status`, payload);
  }
}