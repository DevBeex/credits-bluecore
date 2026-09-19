import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  const auth = {
    token: vi.fn<() => string | null>(),
    isAuthenticated: vi.fn<() => boolean>(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    auth.token.mockReset();
    auth.isAuthenticated.mockReset();
    auth.logout.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('attaches the bearer token when the operator is signed in', () => {
    auth.token.mockReturnValue('jwt-token');

    http.get('/api/v1/credit-requests').subscribe();

    const request = controller.expectOne('/api/v1/credit-requests');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush([]);
  });

  it('does not attach Authorization when there is no token', () => {
    auth.token.mockReturnValue(null);

    http.get('/api/v1/credit-requests').subscribe();

    const request = controller.expectOne('/api/v1/credit-requests');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('logs out on 401 for protected routes', () => {
    auth.token.mockReturnValue('jwt-token');
    auth.isAuthenticated.mockReturnValue(true);

    http.get('/api/v1/credit-requests').subscribe({ error: () => undefined });

    controller.expectOne('/api/v1/credit-requests').flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(auth.logout).toHaveBeenCalled();
  });

  it('does not log out on a failed login attempt', () => {
    auth.token.mockReturnValue(null);
    auth.isAuthenticated.mockReturnValue(false);

    http.post('/api/v1/auth/login', {}).subscribe({ error: () => undefined });

    controller.expectOne('/api/v1/auth/login').flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(auth.logout).not.toHaveBeenCalled();
  });
});
