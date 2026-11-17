import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, required, email, minLength, validate, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../_services/auth/auth.service';
import { NotificationService } from '../_services/notification/notification.service';
import { SetupService } from '../_services/setup/setup.service';

/**
 * First-run setup: creates the first administrator when the system has no users yet. The setup code is
 * printed on the API's console while no user exists, so only someone who can read it can claim the account.
 */
@Component({
  selector: 'wt-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupComponent {
  //Mirrors UserSetupService.MinPasswordLength on the API, which is what actually enforces it.
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private _setupService = inject(SetupService);
  private _authService = inject(AuthService);
  private _notificationService = inject(NotificationService);
  private _router = inject(Router);

  protected readonly model = signal({ userName: '', emailAddress: '', password: '', confirmPassword: '', setupCode: '' });
  public readonly setupForm = form(this.model, (p) => {
    required(p.userName, { message: 'Required.' });
    required(p.emailAddress, { message: 'Required.' });
    email(p.emailAddress, { message: 'Must be a valid email address.' });
    required(p.password, { message: 'Required.' });
    minLength(p.password, SetupComponent.MIN_PASSWORD_LENGTH, { message: `Must be at least ${SetupComponent.MIN_PASSWORD_LENGTH} characters.` });
    required(p.confirmPassword, { message: 'Required.' });
    validate(p.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(p.password)
        ? undefined
        : { kind: 'passwordsMatch', message: 'Passwords must match.' });
    required(p.setupCode, { message: 'Required.' });
  });

  public creatingAdministrator = signal(false);

  public createAdministrator(): void {
    submit(this.setupForm, async () => {
      this.creatingAdministrator.set(true);
      try {
        await firstValueFrom(this._setupService.createFirstAdmin({
          userName: this.model().userName.trim(),
          emailAddress: this.model().emailAddress.trim(),
          password: this.model().password,
          setupCode: this.model().setupCode.trim()
        }));

        this._notificationService.success('Setup complete. Sign in with the administrator account you just created.');
        await this._router.navigate([this._authService.loginRoute]);
      } catch {
        //Nothing to do: GlobalHttpErrorInterceptor has already told the user what went wrong (wrong code, etc.).
      } finally {
        this.creatingAdministrator.set(false);
      }
    });
  }

}
