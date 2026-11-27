import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { form, FormField, required, email, validate, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfigService } from '../../core/_services/config/config.service';
import { PasswordResetTokenDTO, User, UserRole, UserUpdateDTO } from '../../api';
import { toAppError } from '../../core/_http/app-error.mapper';
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

  public id = input.required<string>();

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

  private _resetPasswordUrl: string;

  constructor() {
    this.showPasswordResetButton.set(!this._configService.get("smtpEnabled"));

    //TODO: Inject WINDOW and use that instead of window below
    this._resetPasswordUrl = `${window.location.protocol}//${window.location.host}/user/reset-password`;
  }

  //PUBLIC METHODS

  public ngOnInit(): void {
    this.getUserInfo();
  }

  public saveUser(): void {
    //submit() marks all fields touched and only runs the action when the form is valid.
    submit(this.userEditForm, async () => {
      this.savingUserInfo.set(true);
      this.errorMsg.set(undefined);
      try {
        await firstValueFrom(this._userSvc.updateUser(this.model().publicId, this.getUserUpdateForPersist()));
        this._router.navigate(['admin/users']); //TODO: Find out how to make this relative, not absolute
      } catch (error) {
        if (error instanceof HttpErrorResponse && error.status == 403)
          this.errorMsg.set("You do not have permission to edit users.");
        else
          //For a 400 or 409 this is the API's own explanation, e.g. that the last administrator can't be demoted.
          this.errorMsg.set(toAppError(error, 'PUT').userMessage);
      } finally {
        this.savingUserInfo.set(false);
      }
    });
  }

  public cancel(): void {
    if (this.userEditForm().dirty() && !window.confirm("Cancel without saving changes?")) //TODO: Replace window.confirm with NZ-MODAL
      return;

    this._router.navigate(['/admin/users']);
  }

  public resetPassword(): void {
    //TODO: Replace window usages below with NZ-MODAL
    if (window.confirm("This creates a link that lets the user choose a new password. You will need to give it to them: it works once, and expires. Do you want to proceed?")) {
      this._userSvc.createPasswordReset(this.model().publicId)
        .subscribe((reset: PasswordResetTokenDTO) => {
          //The token is after a #, so it is never sent to a server or written to a log.
          window.alert(`Give the user this link. It works once and expires at ${new Date(reset.expiresAt).toLocaleString()}:\n\n${this._resetPasswordUrl}#token=${reset.token}`);
        });
    }
  }

  //END PUBLIC METHODS

  //PRIVATE METHODS

  private getUserInfo(): void {
    this.loadingUserInfo.set(true);
    this._userSvc.getById(this.id())
      .subscribe({
        next: (user: User) => {
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

  //Only what an administrator is allowed to change: the API leaves everything else about the user alone.
  private getUserUpdateForPersist(): UserUpdateDTO {
    const m = this.model();

    return {
      userName: m.name,
      emailAddress: m.emailAddress,
      role: Number(m.role) as UserRole
    };
  }

  //END PRIVATE METHODS

}
