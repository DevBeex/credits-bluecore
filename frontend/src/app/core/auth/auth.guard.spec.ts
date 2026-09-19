import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  const router = {
    createUrlTree: vi.fn((commands: string[]) => ({ commands }) as unknown as UrlTree),
  };

  function runGuard(isAuthenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => isAuthenticated } },
        { provide: Router, useValue: router },
      ],
    });

    return TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );
  }

  beforeEach(() => {
    router.createUrlTree.mockClear();
  });

  it('allows an authenticated operator', () => {
    expect(runGuard(true)).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects guests to login', () => {
    const result = runGuard(false);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ commands: ['/login'] });
  });
});
