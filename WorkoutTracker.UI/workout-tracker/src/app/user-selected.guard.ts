import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserService } from './user.service';
import { User } from 'app/user';

@Injectable()
export class UserSelectedGuard implements CanActivate {

  constructor(private _userSvc: UserService, private _router: Router) { }

  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this._userSvc.getCurrentUserInfo().subscribe(
      (user: User) => {

        if (user == null) {
          this._router.navigate(['login']);
          return false;
        }

      },

      (error: any) => {
        console.log("Error getting current user info: ", error);

        this._router.navigate(['login']);
        return false;

      }
    );

    return true;

  }

}
