import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserNotSelectedGuard  {
  private _authService = inject(AuthService);
  private _router = inject(Router);


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      let returnValue: boolean = true;

      if(this._authService.isUserLoggedIn) {
        //console.log("User is already logged in");
        returnValue = false;
        this._router.navigate(['home']);
      }

      /*
      if(state.url.indexOf(this._authService.loginRoute) < 0) {
        console.log("Going to login route");
        this._router.navigate([this._authService.loginRoute]);
      }
      */
      //console.log(`No user selected (${this._authService.isUserLoggedIn}). Continuing to route.`);
      return returnValue;

  }

}
