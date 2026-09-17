import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuards', () => {
  let mockAuthService: {
    waitForAuthReady: () => Promise<void>;
    isAuthenticated: () => boolean;
    isAuthorized: () => boolean;
  };
  let mockRouter: {
    createUrlTree: (commands: any[], extras?: any) => UrlTree;
  };

  beforeEach(() => {
    mockAuthService = {
      waitForAuthReady: vi.fn().mockResolvedValue(undefined),
      isAuthenticated: vi.fn().mockReturnValue(false),
      isAuthorized: vi.fn().mockReturnValue(false),
    };

    mockRouter = {
      createUrlTree: vi.fn().mockImplementation(
        (commands, extras) =>
          ({
            commands,
            extras,
            toString: () => commands.join('/'),
          }) as unknown as UrlTree,
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  describe('authGuard', () => {
    it('powinien zezwolić na dostęp gdy użytkownik jest zalogowany i uprawniony', async () => {
      mockAuthService.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthService.isAuthorized = vi.fn().mockReturnValue(true);

      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/games' } as RouterStateSnapshot;

      const result = await TestBed.runInInjectionContext(() => authGuard(route, state));

      expect(mockAuthService.waitForAuthReady).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('powinien przekierować do /login gdy użytkownik nie jest zalogowany', async () => {
      mockAuthService.isAuthenticated = vi.fn().mockReturnValue(false);
      mockAuthService.isAuthorized = vi.fn().mockReturnValue(false);

      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/games' } as RouterStateSnapshot;

      const result = await TestBed.runInInjectionContext(() => authGuard(route, state));

      expect(mockAuthService.waitForAuthReady).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/games' },
      });
      expect(result).toEqual(
        expect.objectContaining({
          commands: ['/login'],
          extras: { queryParams: { returnUrl: '/games' } },
        }),
      );
    });

    it('powinien przekierować do /login gdy użytkownik jest zalogowany, ale nieuprawniony', async () => {
      mockAuthService.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthService.isAuthorized = vi.fn().mockReturnValue(false);

      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/wishlist' } as RouterStateSnapshot;

      const result = await TestBed.runInInjectionContext(() => authGuard(route, state));

      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/wishlist' },
      });
      expect(result).not.toBe(true);
    });
  });

  describe('guestGuard', () => {
    it('powinien zezwolić na wejście na /login niezalogowanemu użytkownikowi', async () => {
      mockAuthService.isAuthenticated = vi.fn().mockReturnValue(false);
      mockAuthService.isAuthorized = vi.fn().mockReturnValue(false);

      const route = { queryParams: {} } as unknown as ActivatedRouteSnapshot;
      const state = { url: '/login' } as RouterStateSnapshot;

      const result = await TestBed.runInInjectionContext(() => guestGuard(route, state));

      expect(mockAuthService.waitForAuthReady).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('powinien przekierować zalogowanego użytkownika z /login do /games', async () => {
      mockAuthService.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthService.isAuthorized = vi.fn().mockReturnValue(true);

      const route = { queryParams: {} } as unknown as ActivatedRouteSnapshot;
      const state = { url: '/login' } as RouterStateSnapshot;

      const result = await TestBed.runInInjectionContext(() => guestGuard(route, state));

      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/games']);
      expect(result).toEqual(
        expect.objectContaining({
          commands: ['/games'],
        }),
      );
    });

    it('powinien przekierować zalogowanego użytkownika z /login do wskazanego returnUrl', async () => {
      mockAuthService.isAuthenticated = vi.fn().mockReturnValue(true);
      mockAuthService.isAuthorized = vi.fn().mockReturnValue(true);

      const route = {
        queryParams: { returnUrl: '/analysis/expenses' },
      } as unknown as ActivatedRouteSnapshot;
      const state = { url: '/login?returnUrl=%2Fanalysis%2Fexpenses' } as RouterStateSnapshot;

      const result = await TestBed.runInInjectionContext(() => guestGuard(route, state));

      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/analysis/expenses']);
      expect(result).toEqual(
        expect.objectContaining({
          commands: ['/analysis/expenses'],
        }),
      );
    });
  });
});
