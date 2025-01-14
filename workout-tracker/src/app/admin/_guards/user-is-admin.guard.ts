import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserIsAdminGuard  {
  private _authService = inject(AuthService);
  private _router = inject(Router);

  
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
