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
    this.createForm();
  }

  public login(): void {
    this.showLoginFailed = false;
    this.loggingIn = true;
    this._authService
      .logIn(this.loginForm.controls.username.value, this.loginForm.controls.password.value)
      .pipe(finalize(() => { this.loggingIn = false; }))
      .subscribe((success: boolean) => {
        window.alert('success: ' + success);
        if(success)
          this._router.navigate(['home']);
        else
          this.showLoginFailed = true;
      });
  }

  private createForm(): void {
    this.loginForm = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

}
