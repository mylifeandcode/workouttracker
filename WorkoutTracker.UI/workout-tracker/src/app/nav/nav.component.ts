import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private _userService: UserService, private _router: Router) { }

  ngOnInit() {
    this._userService.currentUserInfo.subscribe(
      (user: User) => {
        this.userName = (user ? user.name : null);
      });
  }

  public logOff(): void {
    this._userService.logOff();
    this._router.navigate(['login']);
  }

}
