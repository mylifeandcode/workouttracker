import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user.service';

@Component({
  selector: 'wt-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public userName: string;

  constructor(private _userSvc: UserService) { }

  ngOnInit() {
    this._userSvc.getCurrentUserInfo().subscribe(
      (user: User) => {
        this.userName = user.name;
        console.log("User = ", this.userName);
      });
  }

}
