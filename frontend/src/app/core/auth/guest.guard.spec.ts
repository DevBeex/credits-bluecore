import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
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
      guestGuard({} as never, {} as never),
    );
  }

  beforeEach(() => {
    router.createUrlTree.mockClear();
  });

  it('allows guests into login', () => {
    expect(runGuard(false)).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('sends an authenticated operator to solicitudes', () => {
    const result = runGuard(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/solicitudes']);
    expect(result).toEqual({ commands: ['/solicitudes'] });
  });
});
