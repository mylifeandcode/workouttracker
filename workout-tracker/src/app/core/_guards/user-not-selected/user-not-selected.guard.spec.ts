import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';
import { UserNotSelectedGuard } from '../user-not-selected/user-not-selected.guard';
import { type Mocked } from 'vitest';

@Component({
  template: ''
})
class FakeComponent {
}

describe('UserNotSelectedGuard', () => {
    let guard: UserNotSelectedGuard;

    beforeEach(() => {
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            get isUserLoggedIn() { return true; },
            loginRoute: "login"
        };

        TestBed.configureTestingModule({
            imports: [
                RouterModule.forRoot([{ path: 'home', component: FakeComponent }])
            ],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: AuthService,
                    useValue: AuthServiceMock
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
        //const state = <RouterStateSnapshot>{ url: "login" };

        //ACT
        //const result = guard.canActivate(new ActivatedRouteSnapshot(), state);
        const result = guard.canActivate();

        //ASSERT
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['home']);
    });
});
