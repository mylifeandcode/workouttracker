import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../core/user.service';
import { User } from '../core/models/user';
import { AuthService } from 'app/core/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'wt-user-select',
  templateUrl: './user-select.component.html',
  styleUrls: ['./user-select.component.css']
})
export class UserSelectComponent implements OnInit, OnDestroy {
  public users: Array<User>;
  public loadingUsers: boolean = true;
  public errorMsg: string | null = null;
  public gettingUserInfo: boolean = false;
  public username: string | null = null;

  private _allUsers: Subscription;

  constructor(
    private _authService: AuthService, 
    private _userSvc: UserService, 
    private _router: Router) { }

  public ngOnInit(): void {
    this.loadingUsers = true;
    this._allUsers = this._userSvc.all.subscribe((results: Array<User>) => {
      console.log("GOT USERS");
      this.users = results;
      this.loadingUsers = false;
    }, (error: any) => {
      this.errorMsg = error.message;
      this.loadingUsers = false;
    });
  }

  public ngOnDestroy(): void {
    if(this._allUsers)
      this._allUsers.unsubscribe();
  }

  public selectUser(userId: number, userName: string): void {
    this.gettingUserInfo = true;
    this.username = userName;

    this._authService.logIn(userName, "") //TODO: Refactor to require password if user has specified one
      .subscribe((result: boolean) => {
        if(result)
          this._router.navigate(['home']);
        else
          window.alert("Login attempt failed.");
      });
  }

}
