import { Component } from '@angular/core';
import { UserService } from '../../core/_services/user/user.service';
import { User } from '../../core/_models/user';
import { Observable, finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'wt-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    imports: [RouterLink, AsyncPipe]
})
export class UserListComponent {

  public busy: boolean = true;
  public busyMsg: string = '';
  public users$: Observable<User[]> = this._userSvc.all$;
  public errorMsg: string | undefined;

  constructor(private _userSvc: UserService) { } //TODO: We have a caching issue! Fix it!

  public deleteUser(userPublicId: string): void {
    if (!window.confirm("Are you sure you want to delete this user?"))
      return;

    this.busy = true;
    this.busyMsg = "Deleting...";

    this._userSvc.deleteById(userPublicId)
      .pipe(
        finalize(() => {
          this.busy = false;
          this.busyMsg = "";
        })
      )
      .subscribe({
        next: () => {
          //const index = _.findIndex(this.users, (user: User) => user.id == userId);
          //this.users?.splice(index, 1);
        },
        error: (error: any) => this.errorMsg = error
      });
  }

  /*
  private loadUsers(): void {
    //this._userSvc.getAll()
    this.users$ = this._userSvc.all$
      .pipe(
        tap(() => {
          this.busy = true;
          this.busyMsg = "Getting data...";
        }),
        finalize(() => {
          this.busy = false;
          this.busyMsg = "";            
        })
      );
      .subscribe((users: User[]) => {
        this.users = users;
      });
  }
  */

}
