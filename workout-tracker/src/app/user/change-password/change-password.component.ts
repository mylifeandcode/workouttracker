import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required, minLength, validate, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { firstValueFrom } from 'rxjs';

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
    submit(this.changePasswordForm, async () => {
      this.changingPassword.set(true);
      this.errorMessage.set(null);
      this.passwordChanged.set(false);
      try {
        await firstValueFrom(this._authService.changePassword(this.model().currentPassword, this.model().password));
        this.passwordChanged.set(true);
      } catch (error) {
        this.errorMessage.set("Couldn't change password: " + (error instanceof HttpErrorResponse ? error.message : "An error occurred."));
      } finally {
        this.changingPassword.set(false);
      }
    });
  }

  public cancel(): void {

    if (this.changePasswordForm().dirty() && !window.confirm("Cancel without changing password?"))
      return;

    this._router.navigate(['/']);

  }

}
