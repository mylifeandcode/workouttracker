import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../user';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';

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
  private _currentUserId: number;

  constructor(
    private _route: ActivatedRoute,
    private _userSvc: UserService,
    private _formBuilder: FormBuilder,
    private _router: Router) { }

  async ngOnInit() {
    this.loadingUserInfo = true;
    this.getRouteParams();
    this.createForm();
    this._currentUserId = await this.getCurrentUserId();
  }

  private getRouteParams(): void {

    this._route.params.subscribe(params => {
      let userId = params['id'];
      if (userId)
        this.getUserInfo(userId);
      else {
        this._user = new User();
        this._user.id = 0;
      }
    });

  }

  private getUserInfo(userId: number): void {

    this._userSvc.getUserInfo(userId)
      .subscribe(
        (user: User) => this._user = user,
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

    if (this._user) {
      //TODO: Modify so this code doesn't need to set this value
      user.createdByUserId = this._user.createdByUserId;

      user.modifiedByUserId = this._currentUserId;
    }
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

    result.subscribe(
      (user: User) => this._router.navigate(['']),
      (error: any) => this.errorMsg = error,
      () => this.savingUserInfo = false);

  }

  public cancel(): void {
    if (this.userEditForm.dirty && !window.confirm("Cancel without saving changes?"))
        return;

    this._router.navigate(['']);
  }

}
