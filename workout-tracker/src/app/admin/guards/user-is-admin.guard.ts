import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from 'app/core/services/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserIsAdminGuard  {

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
