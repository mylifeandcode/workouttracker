import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required, minLength, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'wt-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    imports: [FormField, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent {
  private _router = inject(Router);
  private _authService = inject(AuthService);

  protected readonly model = signal({ currentPassword: '', password: '', confirmPassword: '' });
  public readonly changePasswordForm = form(this.model, (p) => {
    required(p.currentPassword, { message: 'Required.' });
    required(p.password, { message: 'Required.' });
    minLength(p.password, 7, { message: 'Must be at least 7 characters.' });
    required(p.confirmPassword, { message: 'Required.' });
    minLength(p.confirmPassword, 7, { message: 'Must be at least 7 characters.' });
    validate(p.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(p.password)
        ? undefined
        : { kind: 'passwordsMatch', message: 'Passwords must match.' });
  });

  public loading = signal(true);
  public errorMessage = signal<string | null>(null);
  public changingPassword = signal(false);
  public passwordChanged = signal(false);

  public changePassword(): void {
    if (this.changePasswordForm().valid()) {
      this.changingPassword.set(true);
      this.errorMessage.set(null);
      this.passwordChanged.set(false);
      this._authService.changePassword(
        this.model().currentPassword,
        this.model().password)
        .pipe(finalize(() => { this.changingPassword.set(false); }))
        .subscribe({
          next: () => { this.passwordChanged.set(true); },
          error: (error: HttpErrorResponse) => {
            this.errorMessage.set("Couldn't change password: " + (error?.message ?? "An error occurred."));
          }
        });
    }
  }

  public cancel(): void {

    if (this.changePasswordForm().dirty() && !window.confirm("Cancel without changing password?"))
      return;

    this._router.navigate(['/']);

  }

}
