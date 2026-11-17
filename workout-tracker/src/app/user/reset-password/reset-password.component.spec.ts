import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { of, throwError } from 'rxjs';
import { type Mocked } from 'vitest';

import { ResetPasswordComponent } from './reset-password.component';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;
    let authService: Mocked<AuthService>;
    let router: Router;

    const NEW_PASSWORD = 'someNewPassword-123';

    //The reset link carries its token in the URL fragment, so each test says what the fragment is.
    const route = { snapshot: { fragment: null as string | null } };
    const createComponent = (fragment: string | null): void => {
        route.snapshot.fragment = fragment;
        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    beforeEach(async () => {
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            validatePasswordResetToken: vi.fn<AuthService['validatePasswordResetToken']>().mockReturnValue(of(true)),
            resetPassword: vi.fn<AuthService['resetPassword']>().mockReturnValue(of(undefined))
        };

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), ResetPasswordComponent],
            providers: [
                { provide: AuthService, useValue: AuthServiceMock },
                { provide: ActivatedRoute, useValue: route },
                provideZonelessChangeDetection()
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .overrideComponent(ResetPasswordComponent, {
            remove: { imports: [NzSpinModule] },
            add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        })
            .compileComponents();

        authService = TestBed.inject(AuthService) as Mocked<AuthService>;
        router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate').mockResolvedValue(true);
        vi.spyOn(window, 'alert').mockReturnValue(undefined);
    });

    it('should create', () => {
        createComponent('token=abc123');

        expect(component).toBeTruthy();
    });

    it('should read the token from the URL fragment and validate it', () => {
        createComponent('token=abc123');

        expect(authService.validatePasswordResetToken).toHaveBeenCalledWith('abc123');
        expect(component.validatingResetToken()).toBe(false);
        expect(component.resetLinkInvalid()).toBe(false);
    });

    it('should take the token out of the address bar once it has read it', () => {
        createComponent('token=abc123');

        expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({ fragment: undefined, replaceUrl: true }));
    });

    it('should treat a link with no token as invalid, without asking the API', () => {
        createComponent(null);

        expect(component.resetLinkInvalid()).toBe(true);
        expect(component.validatingResetToken()).toBe(false);
        expect(authService.validatePasswordResetToken).not.toHaveBeenCalled();
    });

    it('should treat a fragment without a token as invalid', () => {
        createComponent('something=else');

        expect(component.resetLinkInvalid()).toBe(true);
        expect(authService.validatePasswordResetToken).not.toHaveBeenCalled();
    });

    it('should treat an expired or unknown link as invalid', () => {
        authService.validatePasswordResetToken.mockReturnValue(of(false));

        createComponent('token=abc123');

        expect(component.resetLinkInvalid()).toBe(true);
    });

    it('should treat a link as invalid, and say why, when it cannot be checked', () => {
        authService.validatePasswordResetToken.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 429 })));

        createComponent('token=abc123');

        expect(component.resetLinkInvalid()).toBe(true);
        expect(component.errorMessage()).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('should be invalid when passwords are empty', () => {
        createComponent('token=abc123');

        expect(component.resetPasswordForm().invalid()).toBe(true);
    });

    it('should flag a passwordsMatch error on confirmPassword when passwords differ', () => {
        createComponent('token=abc123');
        component.resetPasswordForm.password().value.set(NEW_PASSWORD);
        component.resetPasswordForm.confirmPassword().value.set('differentPassword-123');

        expect(component.resetPasswordForm.confirmPassword().errors().some(e => e.kind === 'passwordsMatch')).toBe(true);
    });

    it('should flag a minLength error when the new password is under 12 characters', () => {
        createComponent('token=abc123');
        component.resetPasswordForm.password().value.set('elevenchars');

        expect(component.resetPasswordForm.password().errors().some(e => e.kind === 'minLength')).toBe(true);
    });

    it('should be valid with matching passwords of sufficient length', () => {
        createComponent('token=abc123');
        component.resetPasswordForm.password().value.set(NEW_PASSWORD);
        component.resetPasswordForm.confirmPassword().value.set(NEW_PASSWORD);

        expect(component.resetPasswordForm().valid()).toBe(true);
    });

    it('should reset the password', async () => {
        //ARRANGE
        createComponent('token=abc123');
        component.resetPasswordForm.password().value.set(NEW_PASSWORD);
        component.resetPasswordForm.confirmPassword().value.set(NEW_PASSWORD);

        //ACT
        component.resetPassword();
        await fixture.whenStable(); //submit() runs its action asynchronously

        //ASSERT
        expect(authService.resetPassword).toHaveBeenCalledWith('abc123', NEW_PASSWORD);
        expect(router.navigate).toHaveBeenCalledWith(['']);
        expect(component.resettingPassword()).toBe(false);
    });

    it("should show the API's explanation when the reset is refused", async () => {
        //ARRANGE
        authService.resetPassword.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 400,
            error: { status: 400, detail: 'This reset link is invalid or has expired.' }
        })));
        createComponent('token=abc123');
        component.resetPasswordForm.password().value.set(NEW_PASSWORD);
        component.resetPasswordForm.confirmPassword().value.set(NEW_PASSWORD);

        //ACT
        component.resetPassword();
        await fixture.whenStable();

        //ASSERT
        expect(component.errorMessage()).toBe('This reset link is invalid or has expired.');
        expect(router.navigate).not.toHaveBeenCalledWith(['']);
        expect(component.resettingPassword()).toBe(false);
    });

    it('should not submit when there is no token', async () => {
        //ARRANGE
        createComponent(null);
        component.resetPasswordForm.password().value.set(NEW_PASSWORD);
        component.resetPasswordForm.confirmPassword().value.set(NEW_PASSWORD);

        //ACT
        component.resetPassword();
        await fixture.whenStable();

        //ASSERT
        expect(authService.resetPassword).not.toHaveBeenCalled();
    });
});
