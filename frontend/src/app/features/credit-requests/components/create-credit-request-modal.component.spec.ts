import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { CreditRequestsApi } from '../credit-requests.api';
import { CreateCreditRequestModalComponent } from './create-credit-request-modal.component';

describe('CreateCreditRequestModalComponent', () => {
  const api = { create: vi.fn() };
  let modal: CreateCreditRequestModalComponent;

  beforeEach(async () => {
    api.create.mockReset();

    await TestBed.configureTestingModule({
      imports: [CreateCreditRequestModalComponent],
      providers: [
        provideIonicAngular({ mode: 'md' }),
        { provide: CreditRequestsApi, useValue: api },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateCreditRequestModalComponent);
    modal = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('rejects an amount below the minimum without calling the API', () => {
    modal.form.setValue({
      applicantDocument: '8-123-456',
      amount: '499',
      termMonths: '12',
    });

    modal.submit();

    expect(modal.submitted()).toBe(true);
    expect(api.create).not.toHaveBeenCalled();
  });

  it('trims the document and posts numeric amount and term', () => {
    api.create.mockReturnValue(of({ id: 'req-1' }));
    const created = vi.fn();
    modal.created.subscribe(created);
    modal.form.setValue({
      applicantDocument: '  8-123-456  ',
      amount: '1500.50',
      termMonths: '12',
    });

    modal.submit();

    expect(api.create).toHaveBeenCalledWith({
      applicantDocument: '8-123-456',
      amount: 1500.5,
      termMonths: 12,
    });
    expect(created).toHaveBeenCalled();
    expect(modal.creating()).toBe(false);
  });

  it('emits the API error when create fails', () => {
    api.create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'Datos inválidos' },
          }),
      ),
    );
    const failed = vi.fn();
    modal.failed.subscribe(failed);
    modal.form.setValue({
      applicantDocument: '8-123-456',
      amount: '1500',
      termMonths: '12',
    });

    modal.submit();

    expect(failed).toHaveBeenCalledWith('Datos inválidos');
  });

  it('keeps only digits and two decimal places in the amount', () => {
    modal.onAmountInput({
      detail: { value: '12a3.4567' },
      target: { value: '12a3.4567' },
    } as unknown as Event);

    expect(modal.form.controls.amount.value).toBe('123.45');
  });
});
