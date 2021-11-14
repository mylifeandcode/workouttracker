import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { UserSelectedGuard } from './user-selected.guard';
import { UserService } from 'app/core/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

class UserServiceMock {
  getCurrentUserInfo =
    jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(null));
}

@Component({})
class FakeComponent {

}


describe('UserSelectedGuard', () => {
  let guard: UserSelectedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes(
        [{path: 'login', component: FakeComponent}]) ],
      providers: [
        UserSelectedGuard,
        {
          provide: UserService,
          useClass: UserServiceMock
        }
      ]
    });
    guard = TestBed.inject(UserSelectedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return false from canActivate() and redirect to login route when no user is logged in', () => {
    //ARRANGE
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callThrough();

    //ACT
    const result = guard.canActivate(null, null);

    //ASSERT
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['login']);
  });
});
