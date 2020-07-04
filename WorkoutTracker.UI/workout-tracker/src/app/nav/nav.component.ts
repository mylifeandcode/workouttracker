import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { UserService } from '../users/user.service';

@Component({
  selector: 'wt-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public userName: string;

  get userIsLoggedIn(): boolean {
    return this._userSvc.isUserLoggedIn();
  }

  constructor(private _userSvc: UserService) { }

  ngOnInit() {
    //TODO: Username isn't changing on component when selected user changes. Fix!
    this._userSvc.getCurrentUserInfo().subscribe(
      (user: User) => {
        if (user) {
          this.userName = user.name;
          console.log("User = ", this.userName);
        }
      });
  }

}
