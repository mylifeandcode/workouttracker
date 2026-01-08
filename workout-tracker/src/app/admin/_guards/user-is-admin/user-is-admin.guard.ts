import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../../../core/_services/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserIsAdminGuard  {
  private _authService = inject(AuthService);
  private _router = inject(Router);

  
  //public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
  public canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.isAdmin();
  }

  //public canLoad(route: Route, segments: UrlSegment[]): Observable<boolean>|Promise<boolean>|boolean {
  public canLoad(): Observable<boolean>|Promise<boolean>|boolean {
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
