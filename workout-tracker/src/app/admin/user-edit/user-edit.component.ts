import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../core/user.service';
import { User } from 'app/core/models/user';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ConfigService } from 'app/core/config.service';
import { AuthService } from 'app/core/auth.service';


interface IUserEditForm {
  id: FormControl<number>;
  name: FormControl<string>;
  emailAddress: FormControl<string>;
  role: FormControl<number>;
}

@Component({
  selector: 'wt-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {

  public loadingUserInfo: boolean = true;
  public savingUserInfo: boolean = false;
  public errorMsg: string;
  public userEditForm: FormGroup<IUserEditForm>;
  public showPasswordResetButton: boolean = false;

  private _user: User;
  private _resetPasswordUrlRoot: string;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _userSvc: UserService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _configService: ConfigService,
    private _authService: AuthService,
    private _location: Location) { }

  //PUBLIC METHODS

  public ngOnInit(): void {
    this.showPasswordResetButton = !this._configService.get("smtpEnabled");
    this._resetPasswordUrlRoot = `${window.location.protocol}//${window.location.host}/user/reset-password/`;
    this.loadingUserInfo = true;
    this.createForm();
    this.getUserInfo();
  }

  public saveUser(): void {

    this.savingUserInfo = true;
    const user = this.getUserForPersist();

    const result: Observable<User> =
      (user.id === 0 ? this._userSvc.add(user) : this._userSvc.update(user));

      result
          .pipe(finalize(() => { this.savingUserInfo = false; }))
          .subscribe(
            (savedUser: User) => this._router.navigate(['admin/users']), //TODO: Find out how to make this relative, not absolute
            (error: any) => { 
              if(error?.status == 403)
                this.errorMsg = "You do not have permission to add or edit users.";
              else
                this.errorMsg = error.error ? error.error : "An error has occurred. Please contact an administrator.";
            });
  }

  public cancel(): void {
    if (this.userEditForm.dirty && !window.confirm("Cancel without saving changes?"))
        return;

    this._router.navigate(['/admin/users']);
  }

  public resetPassword(): void {
    if(window.confirm("This will reset the user's password. You will need to provide them with the URL to create their new password. Do you want to proceed?")) {
      this._authService.requestPasswordReset(this.userEditForm.controls.emailAddress.value)
        .subscribe((resetCode: string) => {
          window.alert(`Password has been reset. Instruct user to go to ${this._resetPasswordUrlRoot}${resetCode}.`);
          //console.log("ROUTER: ", this._router);
        });
    }
  }

  //END PUBLIC METHODS

  //PRIVATE METHODS

  private createForm(): void {

    this.userEditForm = this._formBuilder.group<IUserEditForm>({
      id: new FormControl<number>(0, { nonNullable: true }),
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      emailAddress: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email]}),
      role: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)]})
    });

  }

  private getUserInfo(): void {

    this._activatedRoute.params.subscribe(params => {
      const userId = params['id'];
      this.getUserInfoFromService(userId);
    });

  }

  private getUserInfoFromService(userId: number): void {

    this._userSvc.getById(userId)
      .subscribe(
      (user: User) => {
        this._user = user;
        this.userEditForm.patchValue(
          { 
            id: this._user.id, 
            name: this._user.name, 
            emailAddress: this._user.emailAddress, 
            role: this._user.role 
          });
      },
      (error: any) => this.errorMsg = error,
      () => this.loadingUserInfo = false);

  }

  private getUserForPersist(): User {
    const user = new User();

    user.id = this.userEditForm.controls.id.value;
    user.name = this.userEditForm.controls.name.value;
    user.role = this.userEditForm.controls.role.value;

    return user;
  }

  //END PRIVATE METHODS

}