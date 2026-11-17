import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { FirstAdminRequestDTO, SetupStatusDTO } from '../../../api';
import { selfHandled } from '../../_http/http-error-context';
import { ConfigService } from '../config/config.service';

/**
 * First-run setup: creating the first administrator on a system that has no users yet.
 */
@Injectable({
  providedIn: 'root'
})
export class SetupService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);

  //Once the first administrator exists, setup can never be required again, so that answer is
  //remembered and the route guards don't ask the API on every navigation.
  private _setupKnownToBeComplete = false;

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  /**
   * Whether the system still needs its first administrator. If the API can't be asked, the answer is
   * "no": the normal screens then show their own error, which is more useful than a setup page that
   * couldn't submit anyway.
   */
  public isSetupRequired(): Observable<boolean> {
    if (this._setupKnownToBeComplete) return of(false);

    return this._http
      //selfHandled: this runs from route guards, and the failure is swallowed below on purpose.
      .get<SetupStatusDTO>(`${this.apiRoot}/status`, selfHandled())
      .pipe(
        map((status: SetupStatusDTO) => status.setupRequired),
        tap((setupRequired: boolean) => {
          if (!setupRequired) this._setupKnownToBeComplete = true;
        }),
        catchError(() => of(false))
      );
  }

  public createFirstAdmin(request: FirstAdminRequestDTO): Observable<void> {
    return this._http
      .post<void>(`${this.apiRoot}/first-admin`, request)
      .pipe(tap(() => { this._setupKnownToBeComplete = true; }));
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////

  //Read when used, not in a constructor or init(): the route guards that use this run after the app
  //initializer has loaded the config, so no init() step is needed.
  private get apiRoot(): string {
    return this._configService.get("apiRoot") + "setup";
  }
}
