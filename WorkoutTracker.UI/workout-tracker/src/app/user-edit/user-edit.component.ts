import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../user';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'wt-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  private _userId: number;
  private _userName: string;
  private user: User;
  public loadingUserInfo: boolean;
  public errorMsg: string;
  public userEditForm: FormGroup;

  constructor(private _route: ActivatedRoute, private _svc: UserService, private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.getRouteParams();
    this.createForm();
  }

  private getRouteParams(): void {

    this._route.params.subscribe(params => {
      this._userId = params['id'];
      if (this._userId)
        this.getUserInfo();

    });

  }

  private getUserInfo(): void {

    this.loadingUserInfo = true;

    this._svc.getUserInfo(this._userId)
      .subscribe((user: User) => {
        this.user = user;
        this.loadingUserInfo = false;
      },
      (error: any) => {
        this.errorMsg = error;
        this.loadingUserInfo = false;
      });

  }

  private createForm(): void {

    //Use FormBuilder to create our root FormGroup
    this.userEditForm = this._formBuilder.group({
      id: [0, Validators.required], 
      name: ['', Validators.required]
    });

  }

}
