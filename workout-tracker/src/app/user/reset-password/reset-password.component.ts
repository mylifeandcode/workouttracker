import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { CustomValidators } from 'app/core/_validators/custom-validators';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NzSpinModule } from 'ng-zorro-antd/spin';

interface IResetPasswordForm {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
    selector: 'wt-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    imports: [NzSpinModule, RouterLink, FormsModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _authService = inject(AuthService);
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);

  public resetPasswordForm: FormGroup<IResetPasswordForm>;

  public validatingResetCode = signal(true);
  public resetCodeInvalid = signal(false);
  public errorMessage = signal<string | null>(null);
  public resettingPassword = signal(false);

  private _resetCode: string | null = null;

  constructor() { 
      this.resetPasswordForm = this.createForm();
  }

  public ngOnInit(): void {
    this._resetCode = this._activatedRoute.snapshot.params["resetCode"];

    if(!this._resetCode) {
      this.resetCodeInvalid.set(true);
    }
    else {    
      this._authService.validatePasswordResetCode(this._resetCode)
        .pipe(
          finalize(() => { this.validatingResetCode.set(false); }),
          catchError((err: any, caught: Observable<boolean>) => {
            this.errorMessage.set(err.error ? err.error : "An error has occurred. Please contact an administrator.");
            return of(false);
          })        
        )
        .subscribe((isValid: boolean) => {
          if(isValid) this.createForm();
          this.resetCodeInvalid.set(!isValid);
        });
    }
  }

  public resetPassword(): void {
    if (this._resetCode) {
      this.resettingPassword.set(true);
      this._authService.resetPassword(this._resetCode, this.resetPasswordForm.controls.password.value)
        .pipe(
          finalize(() => { this.resettingPassword.set(false); }),
          catchError((err: any, caught: Observable<void>) => {
            this.errorMessage.set(err.error ? err.error : "An error has occurred. Please contact an administrator.");
            return of();
          })
        )
        .subscribe(() => { 
          window.alert("Password has been reset."); 
          this._router.navigate(['']);
        });
    }
  }

  private createForm(): FormGroup<IResetPasswordForm> {
    //TODO: Create a component for password/confirm password
    return this._formBuilder.group<IResetPasswordForm>({
      password: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      confirmPassword: new FormControl<string>('', { nonNullable: true, validators: Validators.required })
    }, { validators: CustomValidators.passwordsMatch });
  }

}
