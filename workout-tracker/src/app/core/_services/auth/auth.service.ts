import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';

interface AuthTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);
  private _localStorageService = inject(LocalStorageService);
  private _router = inject(Router);


  //READ-ONLY FIELDS
  private readonly LOCAL_STORAGE_TOKEN_KEY = "WorkoutTrackerToken";
  private readonly LOCAL_STORAGE_REFRESH_TOKEN_KEY = "WorkoutTrackerRefreshToken";

  //READ-ONLY PROPERTIES
  public get loginRoute(): string {
    return this._loginRoute;
  }

  //PUBLIC FIELDS
  public token: string | null = null; //TODO: Refactor. This should be a read-only property exposing a private field.
  public decodedTokenPayload: JwtPayload | undefined; //This is an interface, not a concrete type

  public currentUserName: WritableSignal<string | null> = signal(null);

  // Refresh token coordination
  public isRefreshing = false;
  public refreshTokenSubject = new BehaviorSubject<string | null>(null);

  //PRIVATE FIELDS
  private _apiRoot: string = '';
  private _loginRoute: string = '';

  //PRIVATE READ-ONLY FIELDS
  private readonly ROLE_CLAIM_TYPE: string = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
  private readonly USER_ID_CLAIM_TYPE: string = "UserID";
  private readonly USER_PUBLIC_ID_CLAIM_TYPE: string = "UserPublicID";
  private readonly NAME_CLAIM_TYPE: string = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

  //PROPERTIES ////////////////////////////////////////////////////////////////

  public get isUserLoggedIn(): boolean {
    return (this.token != null);
  }

  public get isUserAdmin(): boolean {
    if (!this.decodedTokenPayload) return false;
    return this.isUserLoggedIn
      && this.decodedTokenPayload[this.ROLE_CLAIM_TYPE as keyof JwtPayload] == "Administrator";
  }

  public get userId(): number {
    if (!this.decodedTokenPayload) return -1;
    return this.decodedTokenPayload[this.USER_ID_CLAIM_TYPE as keyof JwtPayload] as number;
  }

  public get userPublicId(): string | null {
    if (!this.decodedTokenPayload) return null;
    return this.decodedTokenPayload[this.USER_PUBLIC_ID_CLAIM_TYPE as keyof JwtPayload] as string;
  }  

  //END PROPERTIES ////////////////////////////////////////////////////////////

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public init(): void {
    //Race condition in app initializer prevents this from being done in constructor
    this._apiRoot = this._configService.get("apiRoot") + "auth";
    this._loginRoute = this._configService.get("loginWithUserSelect") ? "user-select" : "login";
  }

  public logIn(username: string, password: string): Observable<boolean> {
    return this._http
      .post<AuthTokenResult>(`${this._apiRoot}/login`, { username, password })
      .pipe(
        tap(() => console.log('Login successful, processing token...')),
        map((result: AuthTokenResult) => {
          this.setTokens(result.accessToken, result.refreshToken, username);
          return true;
        }),
        catchError(() => of(false))
      );
  }

  public logOut(): void {
    // Fire-and-forget revoke call
    if (this.token) {
      this._http.post(`${this._apiRoot}/revoke`, {}).subscribe({ error: () => {} });
    }

    this._localStorageService.remove(this.LOCAL_STORAGE_TOKEN_KEY);
    this._localStorageService.remove(this.LOCAL_STORAGE_REFRESH_TOKEN_KEY);
    this.token = null;
    this.decodedTokenPayload = undefined;
    this.currentUserName.set(null);
    this._router.navigate([this._loginRoute]);
  }

  public refreshAccessToken(): Observable<boolean> {
    const refreshToken = this._localStorageService.get(this.LOCAL_STORAGE_REFRESH_TOKEN_KEY) as string | null;

    if (!this.token || !refreshToken) {
      return of(false);
    }

    return this._http
      .post<AuthTokenResult>(`${this._apiRoot}/refresh`, {
        accessToken: this.token,
        refreshToken: refreshToken
      })
      .pipe(
        map((result: AuthTokenResult) => {
          const username = this.currentUserName() ?? '';
          this.setTokens(result.accessToken, result.refreshToken, username);
          return true;
        }),
        catchError(() => of(false))
      );
  }

  public restoreUserSessionIfApplicable(): void {
    const token: string | null = (this._localStorageService.get(this.LOCAL_STORAGE_TOKEN_KEY) as string | null);
    const refreshToken: string | null = (this._localStorageService.get(this.LOCAL_STORAGE_REFRESH_TOKEN_KEY) as string | null);

    if (token) {
      const decodedToken = jwtDecode<JwtPayload>(token);
      if (decodedToken) {

        if (!this.isExpired(decodedToken?.exp)) {
          // Access token still valid — restore directly
          this.decodedTokenPayload = decodedToken;
          this.token = token;

          const username = <string | null>this.decodedTokenPayload[this.NAME_CLAIM_TYPE as keyof JwtPayload];
          if (username) {
            this.currentUserName.set(username);
          }
        } else if (refreshToken) {
          // Access token expired but refresh token exists — attempt refresh
          this.token = token; // Set temporarily so refreshAccessToken can send it
          this.refreshAccessToken().subscribe(success => {
            if (!success) {
              this.token = null;
              this._localStorageService.remove(this.LOCAL_STORAGE_TOKEN_KEY);
              this._localStorageService.remove(this.LOCAL_STORAGE_REFRESH_TOKEN_KEY);
            }
          });
        }
      }
    }
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

  //END PUBLIC METHODS ////////////////////////////////////////////////////////

  private setTokens(accessToken: string, refreshToken: string, username: string): void {
    this.decodedTokenPayload = jwtDecode<JwtPayload>(accessToken);
    this.token = accessToken;
    this.currentUserName.set(username || this.getUsernameFromToken());
    this._localStorageService.set(this.LOCAL_STORAGE_TOKEN_KEY, accessToken);
    this._localStorageService.set(this.LOCAL_STORAGE_REFRESH_TOKEN_KEY, refreshToken);
  }

  private getUsernameFromToken(): string | null {
    if (!this.decodedTokenPayload) return null;
    return <string | null>this.decodedTokenPayload[this.NAME_CLAIM_TYPE as keyof JwtPayload] ?? null;
  }

  private isExpired(expirationSecondsSinceEpoch: number | undefined): boolean {
    if (!expirationSecondsSinceEpoch) return true;
    return expirationSecondsSinceEpoch < this.getSecondsSinceEpoch();
  }

  private getSecondsSinceEpoch(): number {
    //Hat tip to https://futurestud.io/tutorials/get-number-of-seconds-since-epoch-in-javascript
    const now = new Date();
    const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);
    return utcSecondsSinceEpoch;
  }

}
