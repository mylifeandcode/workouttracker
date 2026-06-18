import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { UserSelectedGuard } from '../user-selected/user-selected.guard';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';
import { type Mocked } from 'vitest';


@Component({
  template: ''
})
class FakeComponent {
}


describe('UserSelectedGuard', () => {
    let guard: UserSelectedGuard;
    let userLoggedIn: boolean;

    beforeEach(() => {
        userLoggedIn = false;
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            //isUserLoggedIn is a getter on AuthService; back it with a closure
            //variable so each test can control it without reassigning the property.
            get isUserLoggedIn() { return userLoggedIn; },
            loginRoute: 'login'
        };

        TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([{ path: 'login', component: FakeComponent }])],
            providers: [
                provideZonelessChangeDetection(),
                UserSelectedGuard,
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
        guard = TestBed.inject(UserSelectedGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });

    it('should return a UrlTree redirecting to the login route when no user is logged in', () => {
        //ARRANGE
        const router = TestBed.inject(Router);

        //ACT
        const result = guard.canActivate();

        //ASSERT
        expect(result instanceof UrlTree).toBe(true);
        expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    });

    it('should return true from canActivate() when a user is logged in', () => {
        //ARRANGE
        userLoggedIn = true;

        //ACT
        const result = guard.canActivate();

        //ASSERT
        expect(result).toBe(true);
    });
});
