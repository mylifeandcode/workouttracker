import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../_services/auth/auth.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

interface ILoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
    selector: 'wt-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, RouterLink, NzSpinModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);


  public loginForm: FormGroup<ILoginForm>;
  public loggingIn = signal<boolean>(false);
  public showLoginFailed = signal<boolean>(false);

  constructor() { 
      this.loginForm = this.createForm();
  }

  public login(): void {
    this.showLoginFailed.set(false);
    this.loggingIn.set(true);
    this._authService
      .logIn(this.loginForm.controls.username.value, this.loginForm.controls.password.value)
      .pipe(finalize(() => { this.loggingIn.set(false); }))
      .subscribe((success: boolean) => {
        if(success)
          this._router.navigate(['home']);
        else
          this.showLoginFailed.set(true);
      });
  }

  private createForm(): FormGroup<ILoginForm> {
    return this._formBuilder.group<ILoginForm>({
      username: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      password: new FormControl<string>('', { nonNullable: true, validators: Validators.required })
    });
  }

}
