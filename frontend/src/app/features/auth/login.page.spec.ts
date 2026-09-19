import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  const auth = { login: vi.fn() };
  const router = { navigateByUrl: vi.fn() };
  let page: LoginPage;

  beforeEach(() => {
    auth.login.mockReset();
    router.navigateByUrl.mockReset();
    page = new LoginPage(
      auth as unknown as AuthService,
      router as unknown as Router,
    );
  });

  it('does not call the API while the form is invalid', () => {
    page.form.controls.password.setValue('short');
    page.submit();

    expect(page.submitted()).toBe(true);
    expect(auth.login).not.toHaveBeenCalled();
    expect(page.submitting()).toBe(false);
  });

  it('sends trimmed lowercase email and navigates on success', () => {
    auth.login.mockReturnValue(of({ accessToken: 'jwt-token' }));
    page.form.setValue({
      email: 'Operator@Bluecore.local',
      password: 'Bluecore123',
    });

    page.submit();

    expect(auth.login).toHaveBeenCalledWith(
      'operator@bluecore.local',
      'Bluecore123',
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/solicitudes');
    expect(page.submitting()).toBe(false);
  });

  it('opens the dialog with the API message on failure', () => {
    auth.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: { message: 'Credenciales inválidas' },
          }),
      ),
    );
    page.form.setValue({
      email: 'operator@bluecore.local',
      password: 'WrongPass1',
    });

    page.submit();

    expect(page.dialogOpen()).toBe(true);
    expect(page.dialogMessage()).toBe('Credenciales inválidas');
    expect(page.submitting()).toBe(false);
  });
});
