import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { User } from '../core/models/user';
import { UserService } from '../core/user.service';

@Component({
  selector: 'wt-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public userName: string;

  get userIsLoggedIn(): boolean {
   return this.userName != null;
  }

  constructor(private _userService: UserService, private _router: Router, private _authService: AuthService) { }

  public ngOnInit(): void {
    this._userService.currentUserInfo.subscribe(
      (user: User) => {
        this.userName = (user ? user.name : null);
      });
  }

  public logOff(): void {
    this._userService.logOff();
    this._authService.token = null; //TODO: Revisit
    this._router.navigate(['login']);
  }

}
