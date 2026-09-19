import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import type { LoginResponse } from './auth.models';

const TOKEN_KEY = 'credit-app.accessToken';
const USER_KEY = 'credit-app.user';

const loginResponse: LoginResponse = {
  accessToken: 'jwt-token',
  tokenType: 'Bearer',
  expiresIn: '8h',
  user: { id: 'user-1', email: 'operator@bluecore.local' },
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const router = { navigateByUrl: vi.fn() };

  beforeEach(() => {
    sessionStorage.clear();
    router.navigateByUrl.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('starts signed out when sessionStorage is empty', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('persists the token and user after login', () => {
    service.login('operator@bluecore.local', 'Bluecore123').subscribe();

    const request = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'operator@bluecore.local',
      password: 'Bluecore123',
    });
    request.flush(loginResponse);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('jwt-token');
    expect(service.user()).toEqual(loginResponse.user);
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('jwt-token');
    expect(sessionStorage.getItem(USER_KEY)).toBe(JSON.stringify(loginResponse.user));
  });

  it('clears the session and navigates to login on logout', () => {
    sessionStorage.setItem(TOKEN_KEY, 'jwt-token');
    sessionStorage.setItem(USER_KEY, JSON.stringify(loginResponse.user));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('ignores a corrupted user payload in sessionStorage', () => {
    sessionStorage.setItem(TOKEN_KEY, 'jwt-token');
    sessionStorage.setItem(USER_KEY, '{not-json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    expect(service.token()).toBe('jwt-token');
    expect(service.user()).toBeNull();
  });
});
