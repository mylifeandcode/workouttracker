import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/user.service';
import { User } from 'app/core/models/user';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'wt-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  public loadingUserInfo: boolean = true;
  public savingUserInfo: boolean = false;
  public errorMsg: string;
  public userEditForm: FormGroup;

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

    this._router.navigate(['']);
  }

  //END PUBLIC METHODS

  //PRIVATE METHODS

  private getUserInfo(): void {

    this._route.params.subscribe(params => {
      const userId = params['id'];
      if (userId && userId > 0)
        this.getUserInfoFromService(userId);
      else {
        this._user = new User();
        this._user.id = 0;
        this.loadingUserInfo = false;
      }
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

  private createForm(): void {

    //Use FormBuilder to create our root FormGroup
    this.userEditForm = this._formBuilder.group({
      id: [0, Validators.required],
      name: ['', Validators.required]
    });

  }

  private getUserForPersist(): User {
    const user = new User();

    user.id = this.userEditForm.get("id")?.value;
    user.name = this.userEditForm.get("name")?.value;

    return user;
  }

  //END PRIVATE METHODS

}
