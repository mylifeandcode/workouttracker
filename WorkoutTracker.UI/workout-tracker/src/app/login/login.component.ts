import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'wt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  public loggingIn: boolean = false;
  public showLoginFailed: boolean = false;

  constructor(
    private _formBuilder: FormBuilder, 
    private _authService: AuthService, 
    private _router: Router) { 

  }

  public ngOnInit(): void {
    if (this._authService.loginRoute != "login")
      this._router.navigate([this._authService.loginRoute]);

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

  public registerNewUser(): void {
    window.alert("Coming soon for this version of login!");
  }

  private createForm(): void {
    this.loginForm = this._formBuilder.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

}
