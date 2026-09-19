import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, input, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { readApiError } from '../../../core/read-api-error';
import { AppButtonComponent } from '../../../shared/ui/app-button.component';
import { AppFieldErrorComponent } from '../../../shared/ui/app-field-error.component';
import {
  APPLICANT_DOCUMENT_MAX,
  CREDIT_AMOUNT_MAX,
  CREDIT_AMOUNT_MIN,
  CREDIT_TERM_MAX,
  CREDIT_TERM_MIN,
} from '../credit-request.constants';
import { CreditRequestsApi } from '../credit-requests.api';

@Component({
  selector: 'app-create-credit-request-modal',
  templateUrl: './create-credit-request-modal.component.html',
  styleUrls: ['./create-credit-request-modal.component.scss'],
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButtons,
    IonIcon,
    AppButtonComponent,
    AppFieldErrorComponent,
  ],
})
export class CreateCreditRequestModalComponent {
  readonly isOpen = input(false);
  readonly closed = output<void>();
  readonly created = output<void>();
  readonly failed = output<string>();

  readonly amountMin = CREDIT_AMOUNT_MIN;
  readonly amountMax = CREDIT_AMOUNT_MAX;
  readonly termMin = CREDIT_TERM_MIN;
  readonly termMax = CREDIT_TERM_MAX;
  readonly creating = signal(false);
  readonly submitted = signal(false);

  readonly documentMessages = {
    required: 'La cédula es obligatoria',
    maxlength: `La cédula no puede superar ${APPLICANT_DOCUMENT_MAX} caracteres`,
  };
  readonly amountMessages = {
    required: 'El monto es obligatorio',
    min: `El monto mínimo es ${CREDIT_AMOUNT_MIN}`,
    max: `El monto máximo es ${CREDIT_AMOUNT_MAX}`,
  };
  readonly termMessages = {
    required: 'El plazo es obligatorio',
    min: `El plazo mínimo es ${CREDIT_TERM_MIN} meses`,
    max: `El plazo máximo es ${CREDIT_TERM_MAX} meses`,
  };

  readonly form = new FormGroup({
    applicantDocument: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(APPLICANT_DOCUMENT_MAX),
      ],
    }),
    amount: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(CREDIT_AMOUNT_MIN),
        Validators.max(CREDIT_AMOUNT_MAX),
      ],
    }),
    termMonths: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(CREDIT_TERM_MIN),
        Validators.max(CREDIT_TERM_MAX),
      ],
    }),
  });

  constructor(private readonly api: CreditRequestsApi) {
    addIcons({ closeOutline });
  }

  onDismiss(): void {
    this.form.reset();
    this.creating.set(false);
    this.submitted.set(false);
    this.closed.emit();
  }

  onAmountInput(event: Event): void {
    const value = this.inputValue(event);
    this.writeSanitized('amount', event, this.onlyDecimal(value));
  }

  onTermInput(event: Event): void {
    const value = this.inputValue(event);
    this.writeSanitized('termMonths', event, value.replace(/\D/g, ''));
  }

  submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.creating()) {
      return;
    }

    const value = this.form.getRawValue();
    this.creating.set(true);

    this.api
      .create({
        applicantDocument: value.applicantDocument.trim(),
        amount: Number(value.amount),
        termMonths: Number(value.termMonths),
      })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.submitted.set(false);
          this.form.reset();
          this.created.emit();
        },
        error: (error: HttpErrorResponse) => {
          this.creating.set(false);
          this.failed.emit(readApiError(error));
        },
      });
  }

  private inputValue(event: Event): string {
    const detail = (event as CustomEvent<{ value?: string | null }>).detail;
    return String(detail?.value ?? '');
  }

  private writeSanitized(
    controlName: 'amount' | 'termMonths',
    event: Event,
    next: string,
  ): void {
    this.form.controls[controlName].setValue(next);
    if (this.inputValue(event) !== next) {
      const target = event.target as HTMLIonInputElement | null;
      if (target) {
        target.value = next;
      }
    }
  }

  private onlyDecimal(value: string): string {
    const cleaned = value.replace(/[^\d.]/g, '');
    const [integerPart, ...fractionParts] = cleaned.split('.');
    if (fractionParts.length === 0) {
      return integerPart;
    }

    return `${integerPart}.${fractionParts.join('').slice(0, 2)}`;
  }
}
