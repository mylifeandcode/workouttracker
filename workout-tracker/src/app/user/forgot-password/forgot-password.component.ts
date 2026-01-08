import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/_services/auth/auth.service';
import { ConfigService } from '../../core/_services/config/config.service';
import { finalize } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

interface IForgotPasswordForm {
  emailAddress: FormControl<string>;
}

@Component({
    selector: 'wt-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent implements OnInit {
  private _configService = inject(ConfigService);
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);

  public forgotPasswordForm: FormGroup<IForgotPasswordForm>;
  public smtpEnabled = signal(false);
  public errorMessage = signal<string | null>(null);
  public requestSuccessful = signal(false);
  public requestInProgress = signal(false);

  constructor() {
    this.forgotPasswordForm = this.buildForm();
  }

  public ngOnInit(): void {
    this.smtpEnabled.set((this._configService.get("smtpEnabled") as boolean) ?? false);
  }

  public submitPasswordResetRequest(): void {
    this.requestInProgress.set(true);
    this.requestSuccessful.set(false);
    this.errorMessage.set(null);
    this._authService
      .requestPasswordReset(this.forgotPasswordForm.controls.emailAddress.value)
      .pipe(finalize(() => { this.requestInProgress.set(false); }))
      .subscribe({
        next: () => { this.requestSuccessful.set(true); },
        error: (error: HttpErrorResponse) => { this.errorMessage.set(error?.message ?? "Password reset request failed. Please try again later."); }
      });
  }

  private buildForm(): FormGroup<IForgotPasswordForm> {
    return this._formBuilder.group<IForgotPasswordForm>({
      emailAddress: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
    });
  }

}
