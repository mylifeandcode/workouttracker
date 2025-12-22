import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { UserSelectedGuard } from '../user-selected/user-selected.guard';
import { Component } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterModule, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';


@Component({
  template: ''
})
class FakeComponent {
}


describe('UserSelectedGuard', () => {
    let guard: UserSelectedGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([{ path: 'login', component: FakeComponent }])],
            providers: [
                provideZonelessChangeDetection(),
                UserSelectedGuard,
                {
                    provide: AuthService,
                    useValue: {
                        isUserLoggedIn: false, loginRoute: 'login'
                    }
                },
                {
                    provide: RouterStateSnapshot,
                    useFactory: {
                        toString: vi.fn().mockName("RouterStateSnapshot.toString")
                    }
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
        vi.spyOn(router, 'navigate');
        const state = <RouterStateSnapshot>{ url: "login" };

        //ACT
        const result = guard.canActivate(new ActivatedRouteSnapshot(), state);

        //ASSERT
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['login']);
    });
});
