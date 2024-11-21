import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../_services/auth/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface ILoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
    selector: 'wt-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, RouterLink, ProgressSpinnerModule]
})
export class LoginComponent {

  public loginForm: FormGroup<ILoginForm>;
  public loggingIn: boolean = false;
  public showLoginFailed: boolean = false;

  constructor(
    private _formBuilder: FormBuilder, 
    private _authService: AuthService, 
    private _router: Router) { 
      this.loginForm = this.createForm();
  }

  public login(): void {
    this.showLoginFailed = false;
    this.loggingIn = true;
    this._authService
      .logIn(this.loginForm.controls.username.value, this.loginForm.controls.password.value)
      .pipe(finalize(() => { this.loggingIn = false; }))
      .subscribe((success: boolean) => {
        if(success)
          this._router.navigate(['home']);
        else
          this.showLoginFailed = true;
      });
  }

  private createForm(): FormGroup<ILoginForm> {
    return this._formBuilder.group<ILoginForm>({
      username: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      password: new FormControl<string>('', { nonNullable: true, validators: Validators.required })
    });
  }

}
