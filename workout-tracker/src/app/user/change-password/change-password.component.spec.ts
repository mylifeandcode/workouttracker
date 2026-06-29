import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from '../../core/_services/auth/auth.service';
import { type Mocked } from 'vitest';

import { ChangePasswordComponent } from './change-password.component';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent;
    let fixture: ComponentFixture<ChangePasswordComponent>;

    /** Marks the form dirty the way a user would: by editing a bound input. */
    const dirtyTheFormViaUi = async (): Promise<void> => {
        const input = fixture.nativeElement.querySelector('input[type=password]') as HTMLInputElement;
        input.value = 'anything';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();
    };

    beforeEach(async () => {
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            // Apparently, this is the way to represent a void Observable.
            changePassword: vi.fn<AuthService['changePassword']>().mockReturnValue(of(undefined))
        };

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), ChangePasswordComponent],
            providers: [
                {
                    provide: AuthService,
                    useValue: AuthServiceMock
                },
                provideZonelessChangeDetection()
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ChangePasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should be invalid when empty', () => {
        expect(component.changePasswordForm().valid()).toBe(false);
    });

    it('should be valid with matching passwords of sufficient length', () => {
        component.changePasswordForm.currentPassword().value.set('somePassword');
        component.changePasswordForm.password().value.set('someNewPassword');
        component.changePasswordForm.confirmPassword().value.set('someNewPassword');

        expect(component.changePasswordForm().valid()).toBe(true);
    });

    it('should flag a passwordsMatch error on confirmPassword when passwords differ', () => {
        component.changePasswordForm.currentPassword().value.set('somePassword');
        component.changePasswordForm.password().value.set('someNewPassword');
        component.changePasswordForm.confirmPassword().value.set('differentPassword');

        expect(component.changePasswordForm().valid()).toBe(false);
        expect(component.changePasswordForm.confirmPassword().errors().some(e => e.kind === 'passwordsMatch')).toBe(true);
    });

    it('should flag a minLength error when the new password is too short', () => {
        component.changePasswordForm.password().value.set('short');

        expect(component.changePasswordForm.password().errors().some(e => e.kind === 'minLength')).toBe(true);
    });

    it('should change password', async () => {
        //ARRANGE
        const authService = TestBed.inject(AuthService);
        component.changePasswordForm.currentPassword().value.set('somePassword');
        component.changePasswordForm.password().value.set('someNewPassword');
        component.changePasswordForm.confirmPassword().value.set('someNewPassword');

        //ACT
        component.changingPassword.set(true); //Set to true to ensure it gets set to false when operation completes
        component.changePassword();
        await fixture.whenStable(); //submit() runs its action asynchronously

        //ASSERT
        expect(authService.changePassword).toHaveBeenCalledTimes(1);
        expect(authService.changePassword).toHaveBeenCalledWith('somePassword', 'someNewPassword');
        expect(component.changingPassword()).toBe(false); //Should be false because operation has completed
    });

    it('should redirect on cancel', async () => {
        //ARRANGE
        await dirtyTheFormViaUi();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate');

        //ACT
        component.cancel();

        //ASSERT
        expect(router.navigate).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not navigate if user decides not to cancel', async () => {
        //ARRANGE
        await dirtyTheFormViaUi();
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        const router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate');

        //ACT
        component.cancel();

        //ASSERT
        expect(router.navigate).not.toHaveBeenCalled();
    });

});
