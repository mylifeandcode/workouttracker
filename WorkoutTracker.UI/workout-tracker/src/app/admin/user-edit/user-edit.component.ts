import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/user.service';
import { User } from 'app/core/models/user';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

interface IUserEditForm {
  id: FormControl<number>;
  name: FormControl<string>;
  password: FormControl<string | null>; //Password is only shown for new users
  confirmPassword: FormControl<string | null>; //Confirm password is only shown for new users
}

@Component({
  selector: 'wt-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  public loadingUserInfo: boolean = true;
  public savingUserInfo: boolean = false;
  public addingNewUser: boolean = false;
  public errorMsg: string;
  public userEditForm: FormGroup<IUserEditForm>;

  private _user: User;

  constructor(
    private _route: ActivatedRoute,
    private _userSvc: UserService,
    private _formBuilder: FormBuilder,
    private _router: Router) { }

  //PUBLIC METHODS

  public ngOnInit(): void {
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

  //END PUBLIC METHODS

  //PRIVATE METHODS

  private createForm(): void {

    this.userEditForm = this._formBuilder.group<IUserEditForm>({
      id: new FormControl<number>(0, { nonNullable: true }),
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      password: new FormControl<string | null>(null),
      confirmPassword: new FormControl<string | null>(null)
    });

  }

  private getUserInfo(): void {

    this._route.params.subscribe(params => {
      const userId = params['id'];
      if (userId && userId > 0) {
        this.getUserInfoFromService(userId);
        this.userEditForm.controls.password.addValidators(Validators.required);
        this.userEditForm.controls.confirmPassword.addValidators([ Validators.required ]);
      }
      else {
        this._user = new User();
        this._user.id = 0;
        this.loadingUserInfo = false;
      }

      this.addingNewUser = this._user.id == 0;
    });

  }

  private getUserInfoFromService(userId: number): void {

    this._userSvc.getById(userId)
      .subscribe(
      (user: User) => {
        this._user = user;
        this.userEditForm.patchValue({ id: this._user.id, name: this._user.name });
      },
      (error: any) => this.errorMsg = error,
      () => this.loadingUserInfo = false);

  }

  private getUserForPersist(): User {
    const user = new User();

    user.id = this.userEditForm.controls.id.value;
    user.name = this.userEditForm.controls.name.value;

    return user;
  }

  //END PRIVATE METHODS

}
