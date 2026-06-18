import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule, RouterStateSnapshot, UrlTree } from '@angular/router';
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
    let userLoggedIn: boolean;

    beforeEach(() => {
        userLoggedIn = true;
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            //isUserLoggedIn is a getter on AuthService; back it with a closure
            //variable so each test can control it without reassigning the property.
            get isUserLoggedIn() { return userLoggedIn; },
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

    it('should return a UrlTree redirecting to home when a user is already logged in', () => {

        //ARRANGE
        const router = TestBed.inject(Router);

        //ACT
        const result = guard.canActivate();

        //ASSERT
        expect(result instanceof UrlTree).toBe(true);
        expect(router.serializeUrl(result as UrlTree)).toBe('/home');
    });

    it('should return true from canActivate() when no user is logged in', () => {

        //ARRANGE
        userLoggedIn = false;

        //ACT
        const result = guard.canActivate();

        //ASSERT
        expect(result).toBe(true);
    });
});
