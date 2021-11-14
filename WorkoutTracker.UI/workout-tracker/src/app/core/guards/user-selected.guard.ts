import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';
import { User } from '../models/user';

@Injectable()
export class UserSelectedGuard implements CanActivate {

  constructor(private _userSvc: UserService, private _router: Router) { }

  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let returnValue: boolean = true;

    this._userSvc.getCurrentUserInfo().subscribe(
      (user: User) => {

        if (user == null) {
          this._router.navigate(['login']);

          returnValue = false;
        }

      },

      (error: any) => {
        console.log("Error getting current user info: ", error);

        this._router.navigate(['login']);
        returnValue =  false;
      }
    );

    return returnValue;

  }

}
