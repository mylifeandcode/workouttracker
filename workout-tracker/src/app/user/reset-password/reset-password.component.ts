import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, required, minLength, validate, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { of, firstValueFrom } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { HttpErrorResponse } from '@angular/common/http';
import { toAppError } from '../../core/_http/app-error.mapper';
import { MIN_PASSWORD_LENGTH } from '../../shared/constants/feature-agnostic-constants';

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
    minLength(p.password, MIN_PASSWORD_LENGTH, { message: `Must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    required(p.confirmPassword, { message: 'Required.' });
    minLength(p.confirmPassword, MIN_PASSWORD_LENGTH, { message: `Must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    validate(p.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(p.password)
        ? undefined
        : { kind: 'passwordsMatch', message: 'Passwords must match.' });
  });

  public validatingResetToken = signal(true);
  public resetLinkInvalid = signal(false);
  public errorMessage = signal<string | null>(null);
  public resettingPassword = signal(false);

  private _resetToken: string | null = null;

  public ngOnInit(): void {
    //The token is in the URL fragment (…/reset-password#token=…), which browsers never send to a server, so it can't end up in
    //server logs or Referer headers. Read it, then take it out of the address bar and history.
    const fragment = this._activatedRoute.snapshot.fragment;
    this._resetToken = fragment ? new URLSearchParams(fragment).get('token') : null;

    if (!this._resetToken) {
      this.resetLinkInvalid.set(true);
      this.validatingResetToken.set(false);
      return;
    }

    this._router.navigate([], { relativeTo: this._activatedRoute, fragment: undefined, replaceUrl: true });

    this._authService.validatePasswordResetToken(this._resetToken)
      .pipe(
        finalize(() => { this.validatingResetToken.set(false); }),
        catchError((err: HttpErrorResponse) => {
          this.errorMessage.set(toAppError(err, 'POST').userMessage);
          return of(false);
        })
      )
      .subscribe((isValid: boolean) => {
        this.resetLinkInvalid.set(!isValid);
      });
  }

  public resetPassword(): void {
    if (!this._resetToken) return;

    submit(this.resetPasswordForm, async () => {
      this.resettingPassword.set(true);
      this.errorMessage.set(null);
      try {
        await firstValueFrom(this._authService.resetPassword(this._resetToken!, this.model().password));
        window.alert("Your password has been reset. You can now sign in with it."); //TODO: Replace window.alert with NZ-MODAL
        this._router.navigate(['']);
      } catch (error) {
        //The API's own explanation: the password rule, or that the link is invalid or has expired.
        this.errorMessage.set(toAppError(error, 'POST').userMessage);
      } finally {
        this.resettingPassword.set(false);
      }
    });
  }

}
