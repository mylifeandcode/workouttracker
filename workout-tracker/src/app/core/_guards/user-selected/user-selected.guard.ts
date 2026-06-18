import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserSelectedGuard  {
  private _authService = inject(AuthService);
  private _router = inject(Router);


  //public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
  public canActivate(): boolean | UrlTree {

    // Return a UrlTree (rather than navigate() + false) so the router resolves
    // the redirect as part of this same navigation — the target component is
    // never instantiated, so there's no flash before the redirect.
    if (!this._authService.isUserLoggedIn) {
      return this._router.parseUrl(this._authService.loginRoute);
    }

    return true;

  }

}
