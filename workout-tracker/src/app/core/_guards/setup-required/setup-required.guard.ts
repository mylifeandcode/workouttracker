import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SetupService } from '../../_services/setup/setup.service';

/**
 * Sends everyone to the first-run setup page until the first administrator has been created.
 */
@Injectable({
  providedIn: 'root'
})
export class SetupRequiredGuard {
  private _setupService = inject(SetupService);
  private _router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    //A UrlTree (rather than navigate() + false) so the router resolves the redirect atomically.
    return this._setupService
      .isSetupRequired()
      .pipe(map((setupRequired: boolean) => setupRequired ? this._router.parseUrl('setup') : true));
  }
}
