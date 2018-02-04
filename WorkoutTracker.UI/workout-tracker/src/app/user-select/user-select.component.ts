import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../user';
import { Observable } from 'rxJs';

@Component({
  selector: 'wt-user-select',
  templateUrl: './user-select.component.html',
  styleUrls: ['./user-select.component.css']
})
export class UserSelectComponent implements OnInit {
  public users: Array<User>;
  public loadingUsers: boolean = true;
  public errorMsg: string = null;

  constructor(private _userSvc: UserService) { }

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

}
