import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class UserNotSelectedGuard implements CanActivate {

  constructor(private _userSvc: UserService, private _router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      let returnValue: boolean = true;

      this._userSvc.getCurrentUserInfo().subscribe(
        (user: User) => {

          if (user != null) {
            this._router.navigate(['home']);
            returnValue = false;
          }

        },

        (error: any) => {
          console.log("Error getting current user info: ", error);

          this._router.navigate(['login']);
          returnValue = false;

        }
      );

      return returnValue;

  }

}
