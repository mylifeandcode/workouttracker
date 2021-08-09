import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { User } from '../models/user';
import { UserService } from '../user.service';

import { UserNotSelectedGuard } from './user-not-selected.guard';

class UserServiceMock {
  getCurrentUserInfo =
    jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User()));
}

@Component({})
class FakeComponent {

}

describe('UserNotSelectedGuard', () => {
  let guard: UserNotSelectedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'home', component: FakeComponent}])
      ],
      providers: [
        {
          provide: UserService,
          useClass: UserServiceMock
        }
      ]
    });
    guard = TestBed.inject(UserNotSelectedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return false from canActivate() and redirect to home when user is not null', () => {

    //ARRANGE
    const userService = TestBed.inject(UserService);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callThrough();

    //ACT
    const result = guard.canActivate(null, null);

    //ASSERT
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['home']);
  });
});
