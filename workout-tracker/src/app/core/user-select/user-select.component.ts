import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../_services/user/user.service';
import { User } from '../_models/user';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'wt-user-select',
  templateUrl: './user-select.component.html',
  styleUrls: ['./user-select.component.scss'],
  imports: [RouterLink, NzSpinModule, AsyncPipe]
})
export class UserSelectComponent {
  private _authService = inject(AuthService);
  private _userSvc = inject(UserService);
  private _router = inject(Router);

  public errorMsg: string | null = null;
  public loggingIn: boolean = false;
  public username: string | null = null;

  //TOOD: Give this a thorough read: https://sebastian-holstein.de/post/error-handling-angular-async-pipe/

  public users$ =
    this._userSvc.all$
      .pipe(
        catchError((err: any, caught: Observable<User[]>) => {
          console.log("ERROR: ", err);
          this.errorMsg = (err.message ? err.message : "An error has occurred. Please contact an administrator.");
          return of(new Array<User>());
        })
      );

  public selectUser(userId: number, userName: string): void {
    this.loggingIn = true;
    this.username = userName;

    this._authService.logIn(userName, "")
      .subscribe((result: boolean) => {
        if (result)
          this._router.navigate(['home']);
        else
          window.alert("Login attempt failed.");
      });
  }

}
