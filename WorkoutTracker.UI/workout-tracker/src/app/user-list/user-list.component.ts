import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../user';

@Component({
  selector: 'wt-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  public loadingUsers: boolean;
  public users: User[] = null;
  public errorMsg: string;

  constructor(private _userSvc: UserService) { }

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loadingUsers = true;
    this._userSvc.getAll().subscribe( //TODO: Add paging and sorting
      (users: User[]) => this.users = users,
      (error: any) => this.errorMsg = error,
      () => this.loadingUsers = false
    );
  }

}
