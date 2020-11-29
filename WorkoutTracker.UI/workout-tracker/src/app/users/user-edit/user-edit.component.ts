import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/user.service';
import { User } from '../../core/models/user';
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
  private _currentUserId: number; //The ID of the user performing the add or edit

  constructor(
    private _route: ActivatedRoute,
    private _userSvc: UserService,
    private _formBuilder: FormBuilder,
    private _router: Router) { }

  async ngOnInit() {
    this.loadingUserInfo = true;
    this.createForm();
    this.getUserInfo();
    this._currentUserId = await this.getCurrentUserId();
}

  private getUserInfo(): void {

    this._route.params.subscribe(params => {
      let userId = params['id'];
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

    this._userSvc.getUserInfo(userId)
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

  private async getCurrentUserId(): Promise<number> {
    let result: User =  await this._userSvc.getCurrentUserInfo().toPromise();
    return result ? result.id : 0;
  }
  
  private getUserForPersist(): User {
    let user = new User();

    user.id = this.userEditForm.get("id").value;
    user.name = this.userEditForm.get("name").value;

    if (this._user.id > 0) 
      user.modifiedByUserId = this._currentUserId;
    else 
      user.createdByUserId = this._currentUserId;

    console.log("User: ", user);
    return user;
  }

  public saveUser(): void {

    this.savingUserInfo = true;
    let user = this.getUserForPersist();

    let result: Observable<User> =
      (user.id === 0 ? this._userSvc.addUser(user) : this._userSvc.updateUser(user));

      result
          .pipe(finalize(() => { this.savingUserInfo = false; }))
          .subscribe(
            (user: User) => this._router.navigate(['users']),
            (error: any) => this.errorMsg = error);
  }

  public cancel(): void {
    if (this.userEditForm.dirty && !window.confirm("Cancel without saving changes?"))
        return;

    this._router.navigate(['']);
  }

}
