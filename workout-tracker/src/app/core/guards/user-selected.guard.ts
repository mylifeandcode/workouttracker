import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class UserSelectedGuard  {

  constructor(private _authService: AuthService, private _router: Router) { }

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
