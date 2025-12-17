import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/_services/auth/auth.service';

import { ChangePasswordComponent } from './change-password.component';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';

class AuthServiceMock {
    // Apparently, this is the way to represent a void Observable.
    changePassword = vi.fn().mockReturnValue(of(undefined));
}

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent;
    let fixture: ComponentFixture<ChangePasswordComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), ReactiveFormsModule, ChangePasswordComponent],
            providers: [
                FormBuilder,
                {
                    provide: AuthService,
                    useClass: AuthServiceMock
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

    it('should create form', () => {
        expect(component.changePasswordForm).not.toBeUndefined();
        expect(component.changePasswordForm.controls.currentPassword.hasValidator(Validators.required)).toBe(true);
        expect(component.changePasswordForm.controls.password.hasValidator(Validators.required)).toBe(true);
        expect(component.changePasswordForm.controls.confirmPassword.hasValidator(Validators.required)).toBe(true);

        //TODO: Revisit. This type of validator requires a different verification than the "required" validator.
        //expect(component.changePasswordForm.controls.password.hasValidator(Validators.minLength(7))).toBeTrue();
    });

    it('should change password', () => {
        //ARRANGE
        const authService = TestBed.inject(AuthService);
        component.changePasswordForm.patchValue({
            currentPassword: 'somePassword',
            password: 'someNewPassword',
            confirmPassword: 'someNewPassword'
        });

        //ACT
        component.changingPassword.set(true); //Set to true to ensure it gets set to false when operation completes
        component.changePassword();

        //ASSERT
        expect(authService.changePassword).toHaveBeenCalledTimes(1);

        //ASSERT
        expect(authService.changePassword).toHaveBeenCalledWith('somePassword', 'someNewPassword');
        expect(component.changingPassword()).toBe(false); //Should be false because operation has completed
    });

    it('should redirect on cancel', () => {
        //ARRANGE
        component.changePasswordForm.controls.confirmPassword.markAsDirty();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate');

        //ACT
        component.cancel();

        //ASSERT
        expect(router.navigate).toHaveBeenCalledTimes(1);

        //ASSERT
        expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not navigate if user decides not to cancel', () => {
        //ARRANGE
        component.changePasswordForm.controls.confirmPassword.markAsDirty();
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        const router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate');

        //ACT
        component.cancel();

        //ASSERT
        expect(router.navigate).not.toHaveBeenCalled();
    });

});
