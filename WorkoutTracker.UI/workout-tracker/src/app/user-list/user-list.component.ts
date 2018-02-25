import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../user';
import * as _ from 'lodash';

@Component({
  selector: 'wt-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

    public busy: boolean;
    public busyMsg: string;
    public users: User[] = null;
    public errorMsg: string;

    constructor(private _userSvc: UserService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    public deleteUser(userId: number): void {
        if (!window.confirm("Are you sure you want to delete this user?"))
            return;

        this.busy = true;
        this.busyMsg = "Deleting...";
        this._userSvc.deleteUser(userId).subscribe(
            () => {
                let index = _.findIndex(this.users, (user: User) => user.id == userId);
                this.users.splice(index);
            },
            (error: any) => this.errorMsg = error,
            () => {
                this.busy = false;
                this.busyMsg = "";
            }
        );
    }

    private loadUsers(): void {
        this.busy = true;
        this.busyMsg = "Loading users...";
        this._userSvc.getAll().subscribe( //TODO: Add paging and sorting
            (users: User[]) => this.users = users,
            (error: any) => this.errorMsg = error,
            () => {
                this.busy = false;
                this.busyMsg = "";
            });
    }

}
