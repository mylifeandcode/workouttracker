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
  users: Array<User>;

  constructor(private _userSvc: UserService) { }

  ngOnInit() {
    this._userSvc.getAll().subscribe((results: Array<User>) => { this.users = results; });
  }

}
