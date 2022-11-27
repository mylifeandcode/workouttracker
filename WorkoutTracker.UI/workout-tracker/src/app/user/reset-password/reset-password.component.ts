import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { CustomValidators } from 'app/validators/custom-validators';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

interface IResetPasswordForm {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'wt-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public validatingResetCode: boolean = true;
  public resetCodeInvalid: boolean = false;
  public errorMessage: string | null = null;
  public resetPasswordForm: FormGroup<IResetPasswordForm>;
  public resettingPassword: boolean = false;

  private _resetCode: string | null = null;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _router: Router) { }

  public ngOnInit(): void {
    this._resetCode = this._activatedRoute.snapshot.params["resetCode"];

    if(!this._resetCode) {
      this.resetCodeInvalid = true;
    }
    
    this._authService.validatePasswordResetCode(this._resetCode!)
      .pipe(
        finalize(() => { this.validatingResetCode = false; }),
        catchError((err: any, caught: Observable<boolean>) => {
          this.errorMessage = (err.error ? err.error : "An error has occurred. Please contact an administrator.");
          return of(false);
        })        
      )
      .subscribe((isValid: boolean) => {
        if(isValid) this.createForm();
        this.resetCodeInvalid = !isValid;
      });
  }

  public resetPassword(): void {
    this.resettingPassword = true;
    this._authService.resetPassword(this._resetCode!, this.resetPasswordForm.controls.password.value)
      .pipe(
        finalize(() => { this.resettingPassword = false; }),
        catchError((err: any, caught: Observable<void>) => {
          this.errorMessage = (err.error ? err.error : "An error has occurred. Please contact an administrator.");
          return of();
        })
      )
      .subscribe(() => { 
        window.alert("Password has been reset."); 
        this._router.navigate(['']);
      });
  }

  private createForm(): void {
    //TODO: Create a component for password/confirm password
    this.resetPasswordForm = this._formBuilder.group<IResetPasswordForm>({
      password: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      confirmPassword: new FormControl<string>('', { nonNullable: true, validators: Validators.required })
    }, { validators: CustomValidators.passwordsMatch });
  }

}