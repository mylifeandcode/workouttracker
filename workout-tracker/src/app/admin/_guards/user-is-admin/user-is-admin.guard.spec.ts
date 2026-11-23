import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from '../../../core/_services/auth/auth.service';
import { type Mocked } from 'vitest';

import { UserIsAdminGuard } from '../user-is-admin/user-is-admin.guard';

describe('UserIsAdminGuard', () => {
  let guard: UserIsAdminGuard;

  const authServiceMock: Mocked<Pick<AuthService, 'isUserAdmin'>> = {
    get isUserAdmin() { return true; }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true); //No routes are registered, so don't let a real navigation run
    guard = TestBed.inject(UserIsAdminGuard);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks(); //Undoes the isUserAdmin getter spies so they can't leak into later tests
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true from canActivate() when user is an admin', () => {
    //const state = <RouterStateSnapshot>{ url: "login" };
    //expect(guard.canActivate(new ActivatedRouteSnapshot(), state)).toBe(true);
    expect(guard.canActivate()).toBe(true);
  });

  it('should return false from canActivate() when user is NOT an admin', () => {
    const authService = TestBed.inject(AuthService);
    vi.spyOn(authService, 'isUserAdmin', 'get').mockReturnValue(false);
    //const state = <RouterStateSnapshot>{ url: "login" };
    //expect(guard.canActivate(new ActivatedRouteSnapshot(), state)).toBe(false);
    expect(guard.canActivate()).toBe(false);
  });

  it('should return true from canLoad() when user is an admin', () => {
    //const path = '/';
    //const fakeRoute: Route = { path };
    //const fakeUrlSegment = { path } as UrlSegment;
    //expect(guard.canLoad(fakeRoute, [fakeUrlSegment])).toBe(true);
    expect(guard.canLoad()).toBe(true);
  });

  it('should return false from canLoad() when user is NOT an admin', () => {
    const authService = TestBed.inject(AuthService);
    vi.spyOn(authService, 'isUserAdmin', 'get').mockReturnValue(false);
    //const path = '/';
    //const fakeRoute: Route = { path };
    //const fakeUrlSegment = { path } as UrlSegment;
    //expect(guard.canLoad(fakeRoute, [fakeUrlSegment])).toBe(false);
    expect(guard.canLoad()).toBe(false);
  });

});
