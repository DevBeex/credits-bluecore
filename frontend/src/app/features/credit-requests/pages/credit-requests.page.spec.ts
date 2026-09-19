import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import type { CreditRequest } from '../credit-request.models';
import { CreditRequestsApi } from '../credit-requests.api';
import { CreditRequestsPage } from './credit-requests.page';

const request: CreditRequest = {
  id: 'req-1',
  applicantDocument: '8-123-456',
  amount: '1500.00',
  termMonths: 12,
  status: 'PENDING',
  decisionComment: null,
  createdById: 'user-1',
  decidedById: null,
  decidedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('CreditRequestsPage', () => {
  const api = {
    list: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  };
  let page: CreditRequestsPage;

  beforeEach(() => {
    api.list.mockReset();
    api.list.mockReturnValue(
      of({
        data: [request],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    );
    page = new CreditRequestsPage(api as unknown as CreditRequestsApi);
  });

  it('loads the first page without a status filter', () => {
    page.ngOnInit();

    expect(api.list).toHaveBeenCalledWith({
      status: undefined,
      page: 1,
      limit: 10,
    });
    expect(page.items()).toEqual([request]);
    expect(page.total()).toBe(1);
    expect(page.loading()).toBe(false);
  });

  it('resets to page 1 when the status filter changes', () => {
    page.page.set(3);
    page.setFilter('PENDING');

    expect(page.statusFilter()).toBe('PENDING');
    expect(page.page()).toBe(1);
    expect(api.list).toHaveBeenCalledWith({
      status: 'PENDING',
      page: 1,
      limit: 10,
    });
  });

  it('does not reload when the same filter is selected again', () => {
    page.setFilter('ALL');
    expect(api.list).not.toHaveBeenCalled();
  });

  it('stores the API error when the list fails', () => {
    api.list.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'Aurora no disponible' },
          }),
      ),
    );

    page.load();

    expect(page.loading()).toBe(false);
    expect(page.listError()).toBe('Aurora no disponible');
  });

  it('after creating, filters pending and shows a success dialog', () => {
    page.onCreated();

    expect(page.createOpen()).toBe(false);
    expect(page.statusFilter()).toBe('PENDING');
    expect(page.page()).toBe(1);
    expect(page.dialogKind()).toBe('success');
    expect(page.dialogTitle()).toBe('Solicitud creada');
    expect(api.list).toHaveBeenCalled();
  });

  it('reloads and confirms after a decision', () => {
    page.openDecision(request, 'APPROVED');
    page.onDecided('APPROVED');

    expect(page.decisionOpen()).toBe(false);
    expect(page.decisionRequest()).toBeNull();
    expect(page.dialogTitle()).toBe('Solicitud aprobada');
    expect(api.list).toHaveBeenCalled();
  });

  it('ignores an out-of-range page', () => {
    page.total.set(10);
    page.goToPage(9);
    expect(api.list).not.toHaveBeenCalled();
  });
});
