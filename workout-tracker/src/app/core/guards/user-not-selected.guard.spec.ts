import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../auth.service';
import { UserNotSelectedGuard } from './user-not-selected.guard';

class AuthServiceMock {
  isUserLoggedIn =
    jasmine.createSpy('isUserLoggedIn').and.returnValue(true);

  loginRoute: string = "login";
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
          provide: AuthService,
          useClass: AuthServiceMock
        },
        {
          provide: RouterStateSnapshot,
          useFactory: jasmine.createSpyObj<RouterStateSnapshot>("RouterStateSnapshot", ['toString'])
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
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callThrough();
    const state = <RouterStateSnapshot>{ url: "login" };

    //ACT
    const result = guard.canActivate(new ActivatedRouteSnapshot(), state);

    //ASSERT
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['home']);
  });
});
