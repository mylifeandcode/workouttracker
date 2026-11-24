import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { UserSelectedGuard } from '../user-selected/user-selected.guard';
import { provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';
import { type Mocked } from 'vitest';


describe('UserSelectedGuard', () => {
    let guard: UserSelectedGuard;
    let userLoggedIn: boolean;

    const authServiceMock: Mocked<Pick<AuthService, 'isUserLoggedIn' | 'loginRoute'>> = {
        //isUserLoggedIn is a getter on AuthService; back it with a closure
        //variable so each test can control it without reassigning the property.
        get isUserLoggedIn() { return userLoggedIn; },
        loginRoute: 'login'
    };
    const routerStateSnapshotMock: Mocked<Pick<RouterStateSnapshot, 'toString'>> = {
        toString: vi.fn<RouterStateSnapshot['toString']>().mockName('toString')
    };

    beforeEach(() => {
        userLoggedIn = false;

        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideZonelessChangeDetection(),
                UserSelectedGuard,
                {
                    provide: AuthService,
                    useValue: authServiceMock
                },
                {
                    provide: RouterStateSnapshot,
                    useValue: routerStateSnapshotMock
                }
            ]
        });
        guard = TestBed.inject(UserSelectedGuard);
    });

    afterEach(() => {
        vi.resetAllMocks();
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
