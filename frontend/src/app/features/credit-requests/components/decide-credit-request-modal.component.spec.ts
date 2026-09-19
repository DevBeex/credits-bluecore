import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import type { CreditRequest } from '../credit-request.models';
import { CreditRequestsApi } from '../credit-requests.api';
import { DecideCreditRequestModalComponent } from './decide-credit-request-modal.component';

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

describe('DecideCreditRequestModalComponent', () => {
  const api = { updateStatus: vi.fn() };
  let modal: DecideCreditRequestModalComponent;

  beforeEach(async () => {
    api.updateStatus.mockReset();

    await TestBed.configureTestingModule({
      imports: [DecideCreditRequestModalComponent],
      providers: [
        provideIonicAngular({ mode: 'md' }),
        { provide: CreditRequestsApi, useValue: api },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DecideCreditRequestModalComponent);
    fixture.componentRef.setInput('request', request);
    fixture.componentRef.setInput('action', 'APPROVED');
    modal = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not call the API when the comment is only whitespace', () => {
    modal.form.controls.comment.setValue('   ');
    modal.submit();

    expect(modal.submitted()).toBe(true);
    expect(api.updateStatus).not.toHaveBeenCalled();
  });

  it('trims the comment and patches the pending request', () => {
    api.updateStatus.mockReturnValue(of(request));
    const decided = vi.fn();
    modal.decided.subscribe(decided);
    modal.form.controls.comment.setValue('  Cumple política  ');

    modal.submit();

    expect(api.updateStatus).toHaveBeenCalledWith('req-1', {
      status: 'APPROVED',
      comment: 'Cumple política',
    });
    expect(decided).toHaveBeenCalledWith('APPROVED');
  });

  it('emits the API error when the decision fails', () => {
    api.updateStatus.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'La solicitud ya fue resuelta' },
          }),
      ),
    );
    const failed = vi.fn();
    const decided = vi.fn();
    modal.failed.subscribe(failed);
    modal.decided.subscribe(decided);
    modal.form.controls.comment.setValue('Rechazada por política');

    modal.submit();

    expect(failed).toHaveBeenCalledWith('La solicitud ya fue resuelta');
    expect(decided).not.toHaveBeenCalled();
  });
});
