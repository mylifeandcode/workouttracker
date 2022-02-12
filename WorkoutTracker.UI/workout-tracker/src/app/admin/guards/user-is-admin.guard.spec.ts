import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

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
});
