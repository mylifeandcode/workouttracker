import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserIsAdminGuard implements CanLoad, CanActivate {

  constructor(private _authService: AuthService, private _router: Router) {}
  
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.isAdmin();
  }

  public canLoad(route: Route, segments: UrlSegment[]): Observable<boolean>|Promise<boolean>|boolean {
    return this.isAdmin();
  }
  
  private isAdmin(): boolean {
    if (!this._authService.isUserAdmin) {
      this._router.navigate(['denied']);
      return false;
    }
    else
      return true;
  }
}
