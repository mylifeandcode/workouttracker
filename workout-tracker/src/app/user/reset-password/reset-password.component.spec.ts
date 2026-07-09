import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { of } from 'rxjs';
import { type Mocked } from 'vitest';

import { ResetPasswordComponent } from './reset-password.component';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;

    beforeEach(async () => {
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            validatePasswordResetCode: vi.fn<AuthService['validatePasswordResetCode']>().mockReturnValue(of(true)),
            resetPassword: vi.fn<AuthService['resetPassword']>().mockReturnValue(of(undefined))
        };

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), ResetPasswordComponent],
            providers: [
                {
                    provide: AuthService,
                    useValue: AuthServiceMock
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                resetCode: 'gar145'
                            }
                        }
                    }
                },
                provideZonelessChangeDetection()
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .overrideComponent(ResetPasswordComponent, {
            remove: { imports: [NzSpinModule] },
            add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        })
            .compileComponents();

        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should validate reset code on init', () => {
        const authService = TestBed.inject(AuthService);
        expect(authService.validatePasswordResetCode).toHaveBeenCalledWith('gar145');
        expect(component.validatingResetCode()).toBe(false);
        expect(component.resetCodeInvalid()).toBe(false);
    });

    it('should be invalid when passwords are empty', () => {
        expect(component.resetPasswordForm().invalid()).toBe(true);
    });

    it('should flag a passwordsMatch error on confirmPassword when passwords differ', () => {
        component.resetPasswordForm.password().value.set('someNewPassword');
        component.resetPasswordForm.confirmPassword().value.set('differentPassword');
        expect(component.resetPasswordForm.confirmPassword().errors().some(e => e.kind === 'passwordsMatch')).toBe(true);
    });

    it('should flag a minLength error when the new password is too short', () => {
        component.resetPasswordForm.password().value.set('short');
        expect(component.resetPasswordForm.password().errors().some(e => e.kind === 'minLength')).toBe(true);
    });

    it('should be valid with matching passwords of sufficient length', () => {
        component.resetPasswordForm.password().value.set('someNewPassword');
        component.resetPasswordForm.confirmPassword().value.set('someNewPassword');
        expect(component.resetPasswordForm().valid()).toBe(true);
    });

    it('should reset the password', async () => {
        //ARRANGE
        const authService = TestBed.inject(AuthService);
        const router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate');
        vi.spyOn(window, 'alert').mockReturnValue(undefined);
        component.resetPasswordForm.password().value.set('someNewPassword');
        component.resetPasswordForm.confirmPassword().value.set('someNewPassword');

        //ACT
        component.resetPassword();
        await fixture.whenStable(); //submit() runs its action asynchronously

        //ASSERT
        expect(authService.resetPassword).toHaveBeenCalledWith('gar145', 'someNewPassword');
        expect(router.navigate).toHaveBeenCalledWith(['']);
        expect(component.resettingPassword()).toBe(false);
    });
});
