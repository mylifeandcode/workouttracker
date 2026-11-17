import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../_services/auth/auth.service';
import { SetupService } from '../../_services/setup/setup.service';

/**
 * Lets the first-run setup page open only while the first administrator doesn't exist yet.
 */
@Injectable({
  providedIn: 'root'
})
export class SetupAvailableGuard {
  private _setupService = inject(SetupService);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this._setupService
      .isSetupRequired()
      .pipe(map((setupRequired: boolean) => setupRequired ? true : this._router.parseUrl(this._authService.loginRoute)));
  }
}
