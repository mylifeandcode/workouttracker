import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, required, email, validate, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { ConfigService } from '../../core/_services/config/config.service';
import { User, UserRole } from '../../api';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../core/_services/user/user.service';
import { EMPTY_GUID } from '../../shared/constants/feature-agnostic-constants';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'wt-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  imports: [FormField, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEditComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _userSvc = inject(UserService);
  private _configService = inject(ConfigService);
  private _authService = inject(AuthService);

  public loadingUserInfo = signal(true);
  public savingUserInfo = signal(false);
  public errorMsg = signal<string | undefined>(undefined);
  public showPasswordResetButton = signal(false);

  protected readonly model = signal({
    id: 0,
    publicId: EMPTY_GUID,
    name: '',
    emailAddress: '',
    role: '0' //Native <select> is string-valued; converted to the numeric enum at persist time
  });

  public readonly userEditForm = form(this.model, (p) => {
    required(p.name, { message: 'Required' });
    required(p.emailAddress, { message: 'Required.' });
    email(p.emailAddress, { message: 'Must be a valid email address.' });
    validate(p.role, ({ value }) => {
      const roleValue = Number(value());
      return roleValue >= 1 && roleValue <= 2 ? undefined : { kind: 'required', message: 'Required' };
    });
  });

  private _user: User | undefined;
  private _resetPasswordUrlRoot: string;

  constructor() {
    this.showPasswordResetButton.set(!this._configService.get("smtpEnabled"));
    this._resetPasswordUrlRoot = `${window.location.protocol}//${window.location.host}/user/reset-password/`;
  }

  //PUBLIC METHODS

  public ngOnInit(): void {
    this.loadingUserInfo.set(true);
    this.getUserInfo();
  }

  public saveUser(): void {
    //submit() marks all fields touched and only runs the action when the form is valid.
    submit(this.userEditForm, async () => {
      this.savingUserInfo.set(true);
      this.errorMsg.set(undefined);
      const user = this.getUserForPersist();

      try {
        await firstValueFrom(user.id === 0 ? this._userSvc.add(user) : this._userSvc.update(user));
        this._router.navigate(['admin/users']); //TODO: Find out how to make this relative, not absolute
      } catch (error) {
        if (error instanceof HttpErrorResponse && error.status == 403)
          this.errorMsg.set("You do not have permission to add or edit users.");
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
    if (this.userEditForm().dirty() && !window.confirm("Cancel without saving changes?"))
      return;

    this._router.navigate(['/admin/users']);
  }

  public resetPassword(): void {
    if (window.confirm("This will reset the user's password. You will need to provide them with the URL to create their new password. Do you want to proceed?")) {
      this._authService.requestPasswordReset(this.model().emailAddress)
        .subscribe((resetCode: string) => {
          window.alert(`Password has been reset. Instruct user to go to ${this._resetPasswordUrlRoot}${resetCode}.`);
          //console.log("ROUTER: ", this._router);
        });
    }
  }

  //END PUBLIC METHODS

  //PRIVATE METHODS

  private getUserInfo(): void {

    this._activatedRoute.params.subscribe(params => {
      const userId = params['id'];
      this.getUserInfoFromService(userId);
    });

  }

  private getUserInfoFromService(userPublicId: string): void {

    this._userSvc.getById(userPublicId)
      .subscribe({
        next: (user: User) => {
          this._user = user;
          this.model.set({
            id: user.id ?? 0,
            publicId: user.publicId ?? EMPTY_GUID,
            name: user.name ?? '',
            emailAddress: user.emailAddress ?? '',
            role: String(user.role ?? 0)
          });
        },
        error: (error: HttpErrorResponse) => this.errorMsg.set(error.message),
        complete: () => this.loadingUserInfo.set(false)
      });

  }

  private getUserForPersist(): User {
    const m = this.model();
    const user = <User>{};

    user.id = m.id;
    user.publicId = m.publicId;
    user.emailAddress = m.emailAddress;
    user.name = m.name;
    user.role = Number(m.role) as UserRole;

    if (this._user?.settings) {
      user.settings = this._user.settings;
    }

    return user;
  }

  //END PRIVATE METHODS

}
