import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserSelectedGuard  {
  private _authService = inject(AuthService);
  private _router = inject(Router);


  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let returnValue: boolean = true;

    if (!this._authService.isUserLoggedIn) {
      returnValue = false;
      //console.log(`Redirecting to ${this._authService.loginRoute}`)
      this._router.navigate([this._authService.loginRoute]);
    }

    return returnValue;

  }

}
