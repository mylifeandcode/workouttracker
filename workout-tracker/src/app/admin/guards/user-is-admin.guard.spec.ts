import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { AuthService } from 'app/core/services/auth.service';

import { UserIsAdminGuard } from './user-is-admin.guard';

class AuthServiceMock {
  public get isUserAdmin(): boolean { return true; }
}

class RouterMock {
  navigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
}

describe('UserIsAdminGuard', () => {
  let guard: UserIsAdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
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
    const state = <RouterStateSnapshot>{ url: "login" };
    expect(guard.canActivate(new ActivatedRouteSnapshot(), state)).toBeTrue();
  });

  it('should return false from canActivate() when user is NOT an admin', () => {
    const authService = TestBed.inject(AuthService);
    spyOnProperty(authService, 'isUserAdmin').and.returnValue(false);
    const state = <RouterStateSnapshot>{ url: "login" };
    expect(guard.canActivate(new ActivatedRouteSnapshot(), state)).toBeFalse();
  });

  it('should return true from canLoad() when user is an admin', () => {
    const path = '/';
    const fakeRoute: Route = { path };
    const fakeUrlSegment = { path } as UrlSegment;
    expect(guard.canLoad(fakeRoute, [fakeUrlSegment])).toBeTrue();
  });

  it('should return false from canLoad() when user is NOT an admin', () => {
    const authService = TestBed.inject(AuthService);
    spyOnProperty(authService, 'isUserAdmin').and.returnValue(false);
    const path = '/';
    const fakeRoute: Route = { path };
    const fakeUrlSegment = { path } as UrlSegment;
    expect(guard.canLoad(fakeRoute, [fakeUrlSegment])).toBeFalse();
  });

});
