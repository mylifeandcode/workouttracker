import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterModule, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';
import { UserNotSelectedGuard } from '../user-not-selected/user-not-selected.guard';

class AuthServiceMock {
    isUserLoggedIn = vi.fn().mockReturnValue(true);

    loginRoute: string = "login";
}

@Component({
  template: ''
})
class FakeComponent {
}

describe('UserNotSelectedGuard', () => {
    let guard: UserNotSelectedGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterModule.forRoot([{ path: 'home', component: FakeComponent }])
            ],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: AuthService,
                    useClass: AuthServiceMock
                },
                {
                    provide: RouterStateSnapshot,
                    useFactory: {
                        toString: vi.fn().mockName("RouterStateSnapshot.toString")
                    }
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
        vi.spyOn(router, 'navigate');
        const state = <RouterStateSnapshot>{ url: "login" };

        //ACT
        const result = guard.canActivate(new ActivatedRouteSnapshot(), state);

        //ASSERT
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['home']);
    });
});
