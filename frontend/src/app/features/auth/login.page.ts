import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonInput,
  IonItem,
} from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';
import { readApiError } from '../../core/read-api-error';
import { AppButtonComponent } from '../../shared/ui/app-button.component';
import { AppDialogComponent } from '../../shared/ui/app-dialog.component';
import { AppFieldErrorComponent } from '../../shared/ui/app-field-error.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonInput,
    AppButtonComponent,
    AppDialogComponent,
    AppFieldErrorComponent,
  ],
})
export class LoginPage {
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly dialogOpen = signal(false);
  readonly dialogMessage = signal('');

  readonly emailMessages = {
    required: 'El correo es obligatorio',
    email: 'Ingresa un correo válido',
  };
  readonly passwordMessages = {
    required: 'La contraseña es obligatoria',
    minlength: 'La contraseña debe tener al menos 8 caracteres',
  };

  readonly form = new FormGroup({
    email: new FormControl('operator@bluecore.local', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);

    const { email, password } = this.form.getRawValue();

    this.auth.login(email.trim().toLowerCase(), password).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl('/solicitudes');
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.dialogMessage.set(readApiError(error));
        this.dialogOpen.set(true);
      },
    });
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }
}
