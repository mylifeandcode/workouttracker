import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '../../core/_services/user/user.service';
import { User } from '../../api';
import { Observable, finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { toAppError } from '../../core/_http/app-error.mapper';

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

  //"Delete" for a user is deactivation: they can no longer sign in and their sessions end, but their workouts and history are
  //kept, and they can be reactivated.
  public deactivateUser(userPublicId: string): void {
    if (!window.confirm("Deactivate this user? They will no longer be able to sign in, but their workouts and history are kept.")) //TODO: Replace window.confirm with NZ-MODAL
      return;

    this.changeActiveState(this._userSvc.deactivate(userPublicId), "Deactivating...");
  }

  public reactivateUser(userPublicId: string): void {
    this.changeActiveState(this._userSvc.reactivate(userPublicId), "Reactivating...");
  }

  private changeActiveState(request: Observable<void>, busyMessage: string): void {
    this.errorMsg.set(undefined);
    this.busy.set(true);
    this.busyMsg.set(busyMessage);

    request
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.busyMsg.set("");
        })
      )
      .subscribe({
        //Shows the API's own explanation for a refusal (you can't deactivate yourself, the last administrator, ...).
        error: (error: HttpErrorResponse) => this.errorMsg.set(toAppError(error, 'PUT').userMessage)
      });
  }

}
