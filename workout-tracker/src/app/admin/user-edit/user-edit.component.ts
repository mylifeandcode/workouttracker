import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { ConfigService } from 'app/core/_services/config/config.service';
import { User } from 'app/core/_models/user';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../core/_services/user/user.service';
import { EMPTY_GUID } from 'app/shared/shared-constants';


interface IUserEditForm {
  id: FormControl<number>;
  publicId: FormControl<string | null>;
  name: FormControl<string>;
  emailAddress: FormControl<string>;
  role: FormControl<number>;
}

@Component({
  selector: 'wt-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEditComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _userSvc = inject(UserService);
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _configService = inject(ConfigService);
  private _authService = inject(AuthService);

  public loadingUserInfo = signal(true);
  public savingUserInfo = signal(false);
  public errorMsg = signal<string | undefined>(undefined);
  public showPasswordResetButton = signal(false);

  public userEditForm: FormGroup<IUserEditForm>;

  private _user: User | undefined;
  private _resetPasswordUrlRoot: string;

  constructor() {

    this.showPasswordResetButton.set(!this._configService.get("smtpEnabled"));
    this._resetPasswordUrlRoot = `${window.location.protocol}//${window.location.host}/user/reset-password/`;
    this.userEditForm = this.createForm();
  }

  //PUBLIC METHODS

  public ngOnInit(): void {
    this.loadingUserInfo.set(true);
    this.getUserInfo();
  }

  public saveUser(): void {

    this.savingUserInfo.set(true);
    const user = this.getUserForPersist();

    const result: Observable<User> =
      (user.id === 0 ? this._userSvc.add(user) : this._userSvc.update(user));

    result
      .pipe(finalize(() => { this.savingUserInfo.set(false); }))
      .subscribe({
        next: () => this._router.navigate(['admin/users']), //TODO: Find out how to make this relative, not absolute
        error: (error: any) => {
          if (error?.status == 403)
            this.errorMsg.set("You do not have permission to add or edit users.");
          else
            this.errorMsg.set(error.error ? error.error : "An error has occurred. Please contact an administrator.");
        }
      });
  }

  public cancel(): void {
    if (this.userEditForm.dirty && !window.confirm("Cancel without saving changes?"))
      return;

    this._router.navigate(['/admin/users']);
  }

  public resetPassword(): void {
    if (window.confirm("This will reset the user's password. You will need to provide them with the URL to create their new password. Do you want to proceed?")) {
      this._authService.requestPasswordReset(this.userEditForm.controls.emailAddress.value)
        .subscribe((resetCode: string) => {
          window.alert(`Password has been reset. Instruct user to go to ${this._resetPasswordUrlRoot}${resetCode}.`);
          //console.log("ROUTER: ", this._router);
        });
    }
  }

  //END PUBLIC METHODS

  //PRIVATE METHODS

  private createForm(): FormGroup<IUserEditForm> {

    return this._formBuilder.group<IUserEditForm>({
      id: new FormControl<number>(0, { nonNullable: true }),
      publicId: new FormControl<string | null>(EMPTY_GUID, { nonNullable: true }),
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      emailAddress: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      role: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] })
    });

  }

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
          this.userEditForm.patchValue(
            {
              id: this._user.id,
              publicId: this._user.publicId,
              name: this._user.name,
              emailAddress: this._user.emailAddress,
              role: this._user.role
            });
        },
        error: (error: any) => this.errorMsg.set(error),
        complete: () => this.loadingUserInfo.set(false)
      });

  }

  private getUserForPersist(): User {
    const user = new User();

    user.id = this.userEditForm.controls.id.value;
    user.publicId = this.userEditForm.controls.publicId.value;
    user.emailAddress = this.userEditForm.controls.emailAddress.value;
    user.name = this.userEditForm.controls.name.value;
    user.role = this.userEditForm.controls.role.value;

    if (this._user?.settings) {
      user.settings = this._user.settings;
    }

    return user;
  }

  //END PRIVATE METHODS

}
