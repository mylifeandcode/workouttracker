import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserProfileDTO } from '../../../api';
import { selfHandled } from '../../_http/http-error-context';
import { BffUser } from './bff-user';

/*
Authentication is a cookie session owned by the BFF. The browser never sees an access or refresh token: it holds an
HttpOnly cookie it cannot read, and this service only tracks WHO the BFF says is signed in. Token refresh, bearer
headers and JWT decoding all live server-side now.
*/
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);
  private _router = inject(Router);

  private readonly DEFAULT_BFF_ROOT = '/bff/';

  //READ-ONLY PROPERTIES
  public get loginRoute(): string {
    return this._loginRoute;
  }

  //PRIVATE FIELDS
  private _apiRoot: string = '';
  private _bffRoot: string = '';
  private _loginRoute: string = '';

  // The signed-in user as reported by the BFF, or null when signed out. The single source of truth for session state.
  private readonly _user = signal<BffUser | null>(null);

  public readonly currentUserName: Signal<string | null> = computed(() => this._user()?.userName ?? null);

  //PROPERTIES ////////////////////////////////////////////////////////////////

  public get isUserLoggedIn(): boolean {
    return this._user() != null;
  }

  public get isUserAdmin(): boolean {
    return this._user()?.isAdmin ?? false;
  }

  public get userId(): number {
    return this._user()?.userId ?? -1;
  }

  public get userPublicId(): string | null {
    return this._user()?.userPublicId ?? null;
  }

  //END PROPERTIES ////////////////////////////////////////////////////////////

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public init(): void {
    //Race condition in app initializer prevents this from being done in constructor
    this._apiRoot = this._configService.get("apiRoot") + "auth";
    // Not every deployed config.json has bffRoot yet; the BFF is always same-origin at /bff/ unless told otherwise.
    this._bffRoot = (this._configService.get("bffRoot") as string | null) || this.DEFAULT_BFF_ROOT;
    this._loginRoute = this._configService.get("loginWithUserSelect") ? "user-select" : "login";
  }

  public logIn(username: string, password: string): Observable<boolean> {
    return this._http
      /*
      selfHandled: the login screen owns the failure message ("Login failed."), which
      it derives from the `false` the catchError below emits. Note that catchError
      alone can't suppress the global notification — the interceptor's error operator
      runs upstream of anything we pipe on here, so it would have already fired.
      */
      .post<BffUser>(`${this._bffRoot}login`, { username, password }, selfHandled())
      .pipe(
        tap((user: BffUser) => this._user.set(user)),
        map(() => true),
        catchError(() => of(false))
      );
  }

  public logOut(): void {
    // Fire-and-forget: the BFF revokes the API tokens and deletes the session. selfHandled: it routinely fails
    // harmlessly (the session may already be dead, which is often why we're logging out) — never user-facing.
    if (this.isUserLoggedIn) {
      this._http.post(`${this._bffRoot}logout`, {}, selfHandled()).subscribe({ error: () => { /* nothing to recover */ } });
    }

    this.clearSession();
  }

  /*
  Called when the server says the session is gone (a 401 on an API call). Unlike logOut() it does NOT call
  /bff/logout: the BFF has already ended the session, so there is nothing left to revoke.
  */
  public handleSessionExpired(): void {
    this.clearSession();
  }

  public restoreUserSessionIfApplicable(): Observable<void> {
    /*
    Asks the BFF whether the browser's cookie belongs to a live session. Returns an Observable so the
    APP_INITIALIZER can wait for it, guaranteeing auth state is settled before any route guard runs.
    selfHandled: a 401 here is the normal "not signed in" answer, and this runs inside provideAppInitializer, before
    the notification host can render anything. Any failure (including the BFF being down) just means "signed out".
    */
    return this._http.get<BffUser>(`${this._bffRoot}user`, selfHandled()).pipe(
      tap((user: BffUser) => this._user.set(user)),
      map(() => undefined),
      catchError(() => {
        this._user.set(null);
        return of(undefined);
      })
    );
  }

  public changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this._http.post<void>(`${this._apiRoot}/change-password`, { currentPassword, newPassword });
  }

  public requestPasswordReset(emailAddress: string): Observable<string> {
    return this._http.post<string>(`${this._apiRoot}/request-password-reset`, { emailAddress });
  }

  public resetPassword(resetCode: string, newPassword: string): Observable<void> {
    return this._http.post<void>(`${this._apiRoot}/reset-password`, { resetCode, newPassword });
  }

  public validatePasswordResetCode(resetCode: string): Observable<boolean> {
    return this._http.get<boolean>(`${this._apiRoot}/validate-reset-code/${resetCode}`);
  }

  public getProfiles(): Observable<UserProfileDTO[]> {
    return this._http.get<UserProfileDTO[]>(`${this._apiRoot}/profiles`);
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////

  private clearSession(): void {
    this._user.set(null);
    this._router.navigate([this._loginRoute]);
  }

}
