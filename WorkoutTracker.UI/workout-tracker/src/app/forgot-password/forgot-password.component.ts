import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth.service';
import { ConfigService } from 'app/core/config.service';
import { finalize } from 'rxjs/operators';

interface IResetPasswordForm {
  emailAddress: FormControl<string>;
}

@Component({
  selector: 'wt-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  public smtpEnabled: boolean;
  public resetPasswordForm: FormGroup<IResetPasswordForm>;
  public errorMessage: string | null = null;
  public requestSuccessful: boolean = false;
  public requestInProgress: boolean = false;

  constructor(
    private _configService: ConfigService, 
    private _formBuilder: FormBuilder, 
    private _authService: AuthService) { 
  }

  public ngOnInit(): void {
    this.smtpEnabled = this._configService.get("smtpEnabled");
    this.buildForm();
  }

  public submitPasswordResetRequest(): void {
    this.requestInProgress = true;
    this.requestSuccessful = false;
    this.errorMessage = null;
    this._authService
      .requestPasswordReset(this.resetPasswordForm.controls.emailAddress.value)
      .pipe(finalize(() => { this.requestInProgress = false; }))
      .subscribe(
        () => { this.requestSuccessful = true; },
        (error: any) => { this.errorMessage = error?.error ?? "Password reset request failed. Please try again later."; }
      );
  }

  private buildForm(): void {
    this.resetPasswordForm = this._formBuilder.group<IResetPasswordForm>({
      emailAddress: new FormControl('', { nonNullable: true, validators: [ Validators.required, Validators.email ] })
    });
  }

}
