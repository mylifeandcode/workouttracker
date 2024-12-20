import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { ConfigService } from 'app/core/_services/config/config.service';
import { finalize } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

interface IForgotPasswordForm {
  emailAddress: FormControl<string>;
}

@Component({
    selector: 'wt-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, RouterLink]
})
export class ForgotPasswordComponent implements OnInit {
  private _configService = inject(ConfigService);
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);


  public smtpEnabled: boolean = false;
  public forgotPasswordForm: FormGroup<IForgotPasswordForm>;
  public errorMessage: string | null = null;
  public requestSuccessful: boolean = false;
  public requestInProgress: boolean = false;

  constructor() {
    this.forgotPasswordForm = this.buildForm();
  }

  public ngOnInit(): void {
    this.smtpEnabled = this._configService.get("smtpEnabled");
  }

  public submitPasswordResetRequest(): void {
    this.requestInProgress = true;
    this.requestSuccessful = false;
    this.errorMessage = null;
    this._authService
      .requestPasswordReset(this.forgotPasswordForm.controls.emailAddress.value)
      .pipe(finalize(() => { this.requestInProgress = false; }))
      .subscribe({
        next: () => { this.requestSuccessful = true; },
        error: (error: any) => { this.errorMessage = error?.error ?? "Password reset request failed. Please try again later."; }
      });
  }

  private buildForm(): FormGroup<IForgotPasswordForm> {
    return this._formBuilder.group<IForgotPasswordForm>({
      emailAddress: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
    });
  }

}
