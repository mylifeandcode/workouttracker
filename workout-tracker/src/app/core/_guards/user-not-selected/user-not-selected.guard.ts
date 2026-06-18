import { Injectable, inject } from '@angular/core';
import { UrlTree, Router } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserNotSelectedGuard  {
  private _authService = inject(AuthService);
  private _router = inject(Router);


  /*
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  */
  canActivate(): boolean | UrlTree {

      // Return a UrlTree (rather than navigate() + false) so the router resolves
      // the redirect atomically and the user-select component never renders for
      // an already-logged-in user.
      if(this._authService.isUserLoggedIn) {
        //console.log("User is already logged in");
        return this._router.parseUrl('home');
      }

      //console.log(`No user selected (${this._authService.isUserLoggedIn}). Continuing to route.`);
      return true;

  }

}
