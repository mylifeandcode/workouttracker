import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../_services/auth/auth.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
    selector: 'wt-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [FormField, RouterLink, NzSpinModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private _authService = inject(AuthService);
  private _router = inject(Router);

  protected readonly model = signal({ username: '', password: '' });
  public readonly loginForm = form(this.model, (p) => {
    required(p.username, { message: 'Username required' });
    required(p.password, { message: 'Password required' });
  });

  public loggingIn = signal<boolean>(false);
  public showLoginFailed = signal<boolean>(false);

  public login(): void {
    submit(this.loginForm, async () => {
      this.showLoginFailed.set(false);
      this.loggingIn.set(true);
      try {
        const success = await firstValueFrom(
          this._authService.logIn(this.model().username, this.model().password));
        if (success)
          this._router.navigate(['home']);
        else
          this.showLoginFailed.set(true);
      } finally {
        this.loggingIn.set(false);
      }
    });
  }

}
