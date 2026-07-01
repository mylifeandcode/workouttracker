import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/_services/user/user.service';
import { firstValueFrom } from 'rxjs';
import { UserNewDTO } from '../../api';

/**
 * This component is for new user creation when the loginWithUserSelect mode is enabled
 */
@Component({
  selector: 'wt-user-select-new',
  templateUrl: './user-select-new.component.html',
  styleUrls: ['./user-select-new.component.scss'],
  imports: [FormField, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSelectNewComponent {
  private _userService = inject(UserService);
  private _router = inject(Router);

  protected readonly model = signal({ name: '', emailAddress: '' });
  public readonly newUserForm = form(this.model, (p) => {
    required(p.name, { message: 'Required.' });
    required(p.emailAddress, { message: 'Required.' });
    email(p.emailAddress, { message: 'Must be a valid email address.' });
  });

  public errorMsg = signal<string | undefined>(undefined);
  public addingUser = signal<boolean>(false);

  public addUser(): void {
    submit(this.newUserForm, async () => {
      this.addingUser.set(true);
      try {
        await firstValueFrom(this._userService.addNew(this.getUserForPersist()));
        this._router.navigate(['/user-select']);
      } finally {
        this.addingUser.set(false);
      }
    });
  }

  private getUserForPersist(): UserNewDTO {
    const user = <UserNewDTO> {
      userName: this.model().name.trim(),
      emailAddress: this.model().emailAddress.trim(),
      password: "No Password. User-select mode!"
    };

    return user;
  }

}
