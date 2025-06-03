import { TestBed } from '@angular/core/testing';

import { UserSelectedGuard } from '../user-selected/user-selected.guard';
import { Component } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterModule, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';


@Component({
    standalone: false
})
class FakeComponent {

}


describe('UserSelectedGuard', () => {
  let guard: UserSelectedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule.forRoot(
        [{path: 'login', component: FakeComponent}]) ],
      providers: [
        UserSelectedGuard,
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj("AuthService", {}, { isUserLoggedIn: false, loginRoute: 'login' })
        },
        {
          provide: RouterStateSnapshot,
          useFactory: jasmine.createSpyObj<RouterStateSnapshot>("RouterStateSnapshot", ['toString'])
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
    const state = <RouterStateSnapshot>{ url: "login" };

    //ACT
    const result = guard.canActivate(new ActivatedRouteSnapshot(), state);

    //ASSERT
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['login']);
  });
});
