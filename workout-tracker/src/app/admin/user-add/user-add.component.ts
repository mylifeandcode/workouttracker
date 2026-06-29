import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, required, email, minLength, validate, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { UserService } from '../../core/_services/user/user.service';
import { firstValueFrom } from 'rxjs';
import { UserNewDTO } from '../../api';

@Component({
  selector: 'wt-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss'],
  imports: [FormField, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAddComponent implements OnInit {
  private _userService = inject(UserService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _authService = inject(AuthService);

  protected readonly model = signal({
    name: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    role: '1' //Native <select> is string-valued; converted to a number at persist time
  });

  public readonly userAddForm = form(this.model, (p) => {
    required(p.name, { message: 'Required.' });
    required(p.emailAddress, { message: 'Required.' });
    email(p.emailAddress, { message: 'Must be a valid email address.' });
    required(p.password, { message: 'Required.' });
    minLength(p.password, 7, { message: 'Must be at least 7 characters.' });
    required(p.confirmPassword, { message: 'Required.' });
    minLength(p.confirmPassword, 7, { message: 'Must be at least 7 characters.' });
    validate(p.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(p.password)
        ? undefined
        : { kind: 'passwordsMatch', message: 'Passwords must match.' });
    validate(p.role, ({ value }) => {
      const roleValue = Number(value());
      return roleValue >= 1 && roleValue <= 2 ? undefined : { kind: 'required', message: 'Required.' };
    });
  });

  public errorMsg = signal<string | undefined>(undefined);
  public savingUserInfo = signal<boolean>(false);
  public showAdminControls = signal<boolean>(false);

  public ngOnInit(): void {
    this.showAdminControls.set((this._activatedRoute.routeConfig?.path == 'users/add'));
  }

  public addUser(): void {
    submit(this.userAddForm, async () => {
      this.savingUserInfo.set(true);
      this.errorMsg.set(undefined);
      try {
        await firstValueFrom(this._userService.addNew(this.getUserForPersist()));
        if (this._authService.isUserLoggedIn)
          this._router.navigate(['admin/users']); //TODO: Find out how to make this relative, not absolute
        else
          this._router.navigate(['/']);
      } catch (error) {
        if (error instanceof HttpErrorResponse && error.status == 403)
          this.errorMsg.set("You do not have permission to add users.");
        else if (error instanceof HttpErrorResponse && error.message)
          this.errorMsg.set(error.message);
        else
          this.errorMsg.set("An error has occurred. Please contact an administrator.");
      } finally {
        this.savingUserInfo.set(false);
      }
    });
  }

  public cancel(): void {
    if (this.userAddForm().dirty() && !window.confirm("Cancel without saving changes?"))
      return;

    if (this.showAdminControls())
      this._router.navigate(['/admin/users']);
    else
      this._router.navigate(['/']);
  }

  private getUserForPersist(): UserNewDTO {
    const { name, emailAddress, password, role } = this.model();

    return <UserNewDTO>{
      userName: name,
      emailAddress,
      password,
      role: Number(role)
    };

  }

}
