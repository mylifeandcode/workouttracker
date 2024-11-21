import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { CustomValidators } from 'app/core/_validators/custom-validators';
import { finalize } from 'rxjs/operators';

interface IChangePasswordForm {
  currentPassword: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
    selector: 'wt-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, RouterLink]
})
export class ChangePasswordComponent {

  public loading: boolean = true;
  public changePasswordForm: FormGroup<IChangePasswordForm>;
  public errorMessage: string | null = null;
  public changingPassword: boolean = false;
  public passwordChanged: boolean = false;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _formBuilder: FormBuilder) {
    this.changePasswordForm = this.createForm();
  }

  public changePassword(): void {
    if (this.changePasswordForm.valid) {
      this.changingPassword = true;
      this.errorMessage = null;
      this.passwordChanged = false;
      this._authService.changePassword(
        this.changePasswordForm.controls.currentPassword.value,
        this.changePasswordForm.controls.password.value)
        .pipe(finalize(() => { this.changingPassword = false; }))
        .subscribe({
          next: () => { this.passwordChanged = true; },
          error: (error: any) => {
            this.errorMessage = "Couldn't change password: " + (error?.error ?? "An error occurred.");
          }
        });
    }
  }

  public cancel(): void {

    if (this.changePasswordForm.dirty && !window.confirm("Cancel without changing password?"))
      return;

    this._router.navigate(['/']);

  }

  private createForm(): FormGroup<IChangePasswordForm> {

    return this._formBuilder.group<IChangePasswordForm>({
      currentPassword: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(7)] }),
      confirmPassword: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(7)] }),
    }, { validators: CustomValidators.passwordsMatch });

  }

}
