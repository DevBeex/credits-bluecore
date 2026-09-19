import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, input, output, signal } from '@angular/core';
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
  IonItem,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { readApiError } from '../../../core/read-api-error';
import { AppButtonComponent } from '../../../shared/ui/app-button.component';
import { AppFieldErrorComponent } from '../../../shared/ui/app-field-error.component';
import { DECISION_COMMENT_MAX } from '../credit-request.constants';
import type { CreditRequest } from '../credit-request.models';
import { CreditRequestsApi } from '../credit-requests.api';

export type DecisionAction = 'APPROVED' | 'REJECTED';

@Component({
  selector: 'app-decide-credit-request-modal',
  templateUrl: './decide-credit-request-modal.component.html',
  styleUrls: ['./decide-credit-request-modal.component.scss'],
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonTextarea,
    IonButtons,
    IonIcon,
    AppButtonComponent,
    AppFieldErrorComponent,
  ],
})
export class DecideCreditRequestModalComponent {
  readonly isOpen = input(false);
  readonly request = input<CreditRequest | null>(null);
  readonly action = input<DecisionAction>('APPROVED');
  readonly closed = output<void>();
  readonly decided = output<DecisionAction>();
  readonly failed = output<string>();

  readonly commentMax = DECISION_COMMENT_MAX;
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly title = computed(() =>
    this.action() === 'APPROVED' ? 'Aprobar solicitud' : 'Rechazar solicitud',
  );
  readonly submitLabel = computed(() =>
    this.action() === 'APPROVED' ? 'Aprobar' : 'Rechazar',
  );
  readonly commentMessages = {
    required: 'El comentario es obligatorio',
    minlength: 'El comentario es obligatorio',
    maxlength: `El comentario no puede superar ${DECISION_COMMENT_MAX} caracteres`,
  };

  readonly form = new FormGroup({
    comment: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(DECISION_COMMENT_MAX),
      ],
    }),
  });

  constructor(private readonly api: CreditRequestsApi) {
    addIcons({ closeOutline });
  }

  amountNumber(amount: string): number {
    return Number(amount);
  }

  onDismiss(): void {
    this.form.reset();
    this.submitting.set(false);
    this.submitted.set(false);
    this.closed.emit();
  }

  submit(): void {
    this.submitted.set(true);
    this.form.controls.comment.setValue(this.form.controls.comment.value.trim());
    this.form.markAllAsTouched();

    const request = this.request();
    if (this.form.invalid || this.submitting() || !request) {
      return;
    }

    this.submitting.set(true);
    this.api
      .updateStatus(request.id, {
        status: this.action(),
        comment: this.form.controls.comment.value,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(false);
          this.form.reset();
          this.decided.emit(this.action());
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.failed.emit(readApiError(error));
        },
      });
  }
}
