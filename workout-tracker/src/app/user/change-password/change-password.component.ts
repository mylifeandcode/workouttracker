import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
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
    imports: [FormsModule, ReactiveFormsModule, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent {
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _formBuilder = inject(FormBuilder);

  public changePasswordForm: FormGroup<IChangePasswordForm>;
  public loading = signal(true);
  public errorMessage = signal<string | null>(null);
  public changingPassword = signal(false);
  public passwordChanged = signal(false);

  constructor() {
    this.changePasswordForm = this.createForm();
  }

  public changePassword(): void {
    if (this.changePasswordForm.valid) {
      this.changingPassword.set(true);
      this.errorMessage.set(null);
      this.passwordChanged.set(false);
      this._authService.changePassword(
        this.changePasswordForm.controls.currentPassword.value,
        this.changePasswordForm.controls.password.value)
        .pipe(finalize(() => { this.changingPassword.set(false); }))
        .subscribe({
          next: () => { this.passwordChanged.set(true); },
          error: (error: any) => {
            this.errorMessage.set("Couldn't change password: " + (error?.error ?? "An error occurred."));
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
