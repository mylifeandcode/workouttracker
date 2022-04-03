import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserNotSelectedGuard implements CanActivate {

  constructor(private _authService: AuthService, private _router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      let returnValue: boolean = true;

      if(this._authService.isUserLoggedIn) {
        returnValue = false;
        this._router.navigate(['home']);
      }

      if(state.url.indexOf(this._authService.loginRoute) < 0)
        this._router.navigate([this._authService.loginRoute]);

      return returnValue;

  }

}
