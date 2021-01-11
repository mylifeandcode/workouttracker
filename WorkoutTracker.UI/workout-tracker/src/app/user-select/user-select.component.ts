import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../core/user.service';
import { User } from '../core/models/user';

@Component({
  selector: 'wt-user-select',
  templateUrl: './user-select.component.html',
  styleUrls: ['./user-select.component.css']
})
export class UserSelectComponent implements OnInit {
  public users: Array<User>;
  public loadingUsers: boolean = true;
  public errorMsg: string = null;
  public gettingUserInfo: boolean = false;
  public username: string = null;

  constructor(private _userSvc: UserService, private _router: Router) { }

  ngOnInit() {
    this.loadingUsers = true;
    this._userSvc.getAll().subscribe((results: Array<User>) => {
      this.users = results;
      this.loadingUsers = false;
    }, (error: any) => {
      this.errorMsg = error;
      this.loadingUsers = false;
    });
  }

  public selectUser(userId: number, userName: string): void {
    this.gettingUserInfo = true;
    this.username = userName;

    //this._userSvc.getUserInfo(userId)
    this._userSvc.logIn(userId)
      .subscribe(
        (user: User) => {
          //this._userSvc.setCurrentUser(user);
          this._router.navigate(['home']);
        },
        (error: any) => this.errorMsg = error,
        () => this.gettingUserInfo = false);
  }

}
