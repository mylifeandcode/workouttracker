import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';

interface ILoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'wt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup<ILoginForm>;
  public loggingIn: boolean = false;
  public showLoginFailed: boolean = false;

  constructor(
    private _formBuilder: FormBuilder, 
    private _authService: AuthService, 
    private _router: Router) { 

  }

  public ngOnInit(): void {
    this.createForm();
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

  private createForm(): void {
    this.loginForm = this._formBuilder.group<ILoginForm>({
      username: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      password: new FormControl<string>('', { nonNullable: true, validators: Validators.required })
    });
  }

}
