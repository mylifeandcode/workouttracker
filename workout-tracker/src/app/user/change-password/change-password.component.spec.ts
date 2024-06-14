import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'app/core/services/auth/auth.service';

import { ChangePasswordComponent } from './change-password.component';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';

class AuthServiceMock {
  changePassword = jasmine.createSpy('changePassword').and.returnValue(of(undefined)); //Apparently, this is the way to represent a void Observable.
}

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RouterModule.forRoot([]), ReactiveFormsModule ],
      declarations: [ ChangePasswordComponent ],
      providers: [
        FormBuilder,
        {
          provide: AuthService,
          useClass: AuthServiceMock
        }
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
    expect(component.changePasswordForm.controls.currentPassword.hasValidator(Validators.required)).toBeTrue();
    expect(component.changePasswordForm.controls.password.hasValidator(Validators.required)).toBeTrue();
    expect(component.changePasswordForm.controls.confirmPassword.hasValidator(Validators.required)).toBeTrue();

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
    component.changePassword();

    //ASSERT
    expect(authService.changePassword).toHaveBeenCalledOnceWith('somePassword', 'someNewPassword');
  });

  it('should redirect on cancel', () => {
    //ARRANGE
    component.changePasswordForm.controls.confirmPassword.markAsDirty();
    spyOn(window, 'confirm').and.returnValue(true);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    //ACT
    component.cancel();

    //ASSERT
    expect(router.navigate).toHaveBeenCalledOnceWith(['/']);
  });

  it('should not navigate if user decides not to cancel', () => {
    //ARRANGE
    component.changePasswordForm.controls.confirmPassword.markAsDirty();
    spyOn(window, 'confirm').and.returnValue(false);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    //ACT
    component.cancel();

    //ASSERT
    expect(router.navigate).not.toHaveBeenCalled();
  });

});
