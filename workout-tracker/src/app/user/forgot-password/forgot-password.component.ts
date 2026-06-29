import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { AuthService } from '../../core/_services/auth/auth.service';
import { ConfigService } from '../../core/_services/config/config.service';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'wt-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    imports: [FormField, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent implements OnInit {
  private _configService = inject(ConfigService);
  private _authService = inject(AuthService);

  protected readonly model = signal({ emailAddress: '' });
  public readonly forgotPasswordForm = form(this.model, (p) => {
    required(p.emailAddress, { message: 'Required.' });
    email(p.emailAddress, { message: 'Value must be a valid email address.' });
  });

  public smtpEnabled = signal(false);
  public errorMessage = signal<string | null>(null);
  public requestSuccessful = signal(false);
  public requestInProgress = signal(false);

  public ngOnInit(): void {
    this.smtpEnabled.set((this._configService.get("smtpEnabled") as boolean) ?? false);
  }

  public submitPasswordResetRequest(): void {
    submit(this.forgotPasswordForm, async () => {
      this.requestInProgress.set(true);
      this.requestSuccessful.set(false);
      this.errorMessage.set(null);
      try {
        await firstValueFrom(this._authService.requestPasswordReset(this.model().emailAddress));
        this.requestSuccessful.set(true);
      } catch (error) {
        this.errorMessage.set(error instanceof HttpErrorResponse ? error.message : "Password reset request failed. Please try again later.");
      } finally {
        this.requestInProgress.set(false);
      }
    });
  }

}
