import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, required, minLength, validate, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { of, firstValueFrom } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'wt-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    imports: [NzSpinModule, RouterLink, FormField],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  protected readonly model = signal({ password: '', confirmPassword: '' });
  public readonly resetPasswordForm = form(this.model, (p) => {
    required(p.password, { message: 'Required.' });
    minLength(p.password, 7, { message: 'Must be at least 7 characters.' });
    required(p.confirmPassword, { message: 'Required.' });
    minLength(p.confirmPassword, 7, { message: 'Must be at least 7 characters.' });
    validate(p.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(p.password)
        ? undefined
        : { kind: 'passwordsMatch', message: 'Passwords must match.' });
  });

  public validatingResetCode = signal(true);
  public resetCodeInvalid = signal(false);
  public errorMessage = signal<string | null>(null);
  public resettingPassword = signal(false);

  private _resetCode: string | null = null;

  public ngOnInit(): void {
    this._resetCode = this._activatedRoute.snapshot.params["resetCode"];

    if(!this._resetCode) {
      this.resetCodeInvalid.set(true);
    }
    else {
      this._authService.validatePasswordResetCode(this._resetCode)
        .pipe(
          finalize(() => { this.validatingResetCode.set(false); }),
          catchError((err: HttpErrorResponse) => {
            this.errorMessage.set(err.message ? err.message : "An error has occurred. Please contact an administrator.");
            return of(false);
          })
        )
        .subscribe((isValid: boolean) => {
          this.resetCodeInvalid.set(!isValid);
        });
    }
  }

  public resetPassword(): void {
    if (!this._resetCode) return;

    submit(this.resetPasswordForm, async () => {
      this.resettingPassword.set(true);
      this.errorMessage.set(null);
      try {
        await firstValueFrom(this._authService.resetPassword(this._resetCode!, this.model().password));
        window.alert("Password has been reset.");
        this._router.navigate(['']);
      } catch (error) {
        this.errorMessage.set(error instanceof HttpErrorResponse && error.message
          ? error.message
          : "An error has occurred. Please contact an administrator.");
      } finally {
        this.resettingPassword.set(false);
      }
    });
  }

}
