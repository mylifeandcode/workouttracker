import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from '../../../core/_services/auth/auth.service';

import { UserIsAdminGuard } from '../user-is-admin/user-is-admin.guard';

class AuthServiceMock {
  private readonly adminStatus = true; //readonly to satisfy linter rule
  public get isUserAdmin(): boolean { return this.adminStatus; }
}

class RouterMock {
  navigate = vi.fn().mockReturnValue(Promise.resolve(true));
}

describe('UserIsAdminGuard', () => {
  let guard: UserIsAdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: AuthService,
          useClass: AuthServiceMock
        },
        {
          provide: Router,
          useClass: RouterMock
        }
      ]
    });
    guard = TestBed.inject(UserIsAdminGuard);
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
