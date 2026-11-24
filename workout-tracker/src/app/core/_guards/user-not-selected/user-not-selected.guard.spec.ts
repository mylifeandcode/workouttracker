import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';
import { UserNotSelectedGuard } from '../user-not-selected/user-not-selected.guard';
import { type Mocked } from 'vitest';

describe('UserNotSelectedGuard', () => {
    let guard: UserNotSelectedGuard;
    let userLoggedIn: boolean;

    const authServiceMock: Mocked<Pick<AuthService, 'isUserLoggedIn' | 'loginRoute'>> = {
        //isUserLoggedIn is a getter on AuthService; back it with a closure
        //variable so each test can control it without reassigning the property.
        get isUserLoggedIn() { return userLoggedIn; },
        loginRoute: "login"
    };
    const routerStateSnapshotMock: Mocked<Pick<RouterStateSnapshot, 'toString'>> = {
        toString: vi.fn<RouterStateSnapshot['toString']>().mockName('toString')
    };

    beforeEach(() => {
        userLoggedIn = true;

        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideZonelessChangeDetection(),
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
        guard = TestBed.inject(UserNotSelectedGuard);
    });

    afterEach(() => {
        vi.resetAllMocks();
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
