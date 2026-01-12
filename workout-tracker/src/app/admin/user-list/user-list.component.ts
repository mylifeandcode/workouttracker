import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '../../core/_services/user/user.service';
import { User } from '../../core/_models/user';
import { Observable, finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'wt-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [RouterLink, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  private readonly _userSvc = inject(UserService);

  public users$: Observable<User[]> = this._userSvc.all$;

  public busy = signal<boolean>(true);
  public busyMsg = signal<string>('');
  public errorMsg = signal<string | undefined>(undefined); //TODO: We have a caching issue! Fix it!

  public deleteUser(userPublicId: string): void {
    if (!window.confirm("Are you sure you want to delete this user?"))
      return;

    this.busy.set(true);
    this.busyMsg.set("Deleting...");

    this._userSvc.deleteById(userPublicId)
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.busyMsg.set("");
        })
      )
      .subscribe({
        next: () => {
          //const index = _.findIndex(this.users, (user: User) => user.id == userId);
          //this.users?.splice(index, 1);
        },
        error: (error: HttpErrorResponse) => this.errorMsg.set(error.message)
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
