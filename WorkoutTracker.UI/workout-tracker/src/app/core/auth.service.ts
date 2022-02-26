import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { map } from 'rxjs/operators';


const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

const HTTP_OPTIONS_FOR_TEXT_RESPONSE = {
  headers: new HttpHeaders({
    'Accept': 'text/html, application/xhtml+xml, */*',
    'Content-Type':  'application/json'
  }), 
  responseType: 'text' as 'json'
};


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  //READ-ONLY FIELDS
  private readonly LOCAL_STORAGE_TOKEN_KEY = "WorkoutTrackerToken";

  //PUBLIC FIELDS
  public token: string;
  public decodedTokenPayload: JwtPayload;

  //PRIVATE FIELDS
  private _apiRoot: string;

  private _userSubject$ = new BehaviorSubject<string>(null);
  private _userObservable$: Observable<string> = this._userSubject$.asObservable();

  //PRIVATE READ-ONLY FIELDS
  private readonly ROLE_CLAIM_TYPE: string = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
 
  constructor(
    private _http: HttpClient, 
    private _configService: ConfigService, 
    private _localStorageService: LocalStorageService, 
    private _router: Router) { 

  }

  //PROPERTIES ////////////////////////////////////////////////////////////////
  
  public get currentUserName(): Observable<string> {
    return this._userObservable$;
  }

  public get isUserLoggedIn(): boolean {
    //return (this._userSubject$.value != null);
    return (this.token != null);
  }

  public get isUserAdmin(): boolean {
    return this.isUserLoggedIn
      && this.decodedTokenPayload[this.ROLE_CLAIM_TYPE] == "Administrator";
  }

  //END PROPERTIES ////////////////////////////////////////////////////////////

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public init(): void {
    //Race condition in app initializer prevents this from being done in constructor
    this._apiRoot = this._configService.get("apiRoot") + "auth";
  }

  public logIn(username: string, password: string): Observable<boolean> {
    return this._http.post<string>(`${this._apiRoot}/login`, { username, password }, HTTP_OPTIONS_FOR_TEXT_RESPONSE) //TODO: Create strong type for credentials object
      .pipe(
        map((token: string) => {
          //Using map() here so I can act on the result and then return a boolean.
          //TODO: Revisit the approach I'm using here. Probably a better way of doing this.
          this.token = token;
          this._userSubject$.next(username);
          this._localStorageService.set(this.LOCAL_STORAGE_TOKEN_KEY, token);
          this.decodedTokenPayload = jwtDecode<JwtPayload>(this.token);
          return true;
        })
      );
  }


  public logOut(): void {
    this._localStorageService.remove(this.LOCAL_STORAGE_TOKEN_KEY);
    this.token = null;
    this._userSubject$.next(null);
    this._router.navigate(['login']);
  }
  
  public restoreUserSessionIfApplicable(): void {
    const token: string = this._localStorageService.get(this.LOCAL_STORAGE_TOKEN_KEY);

    if (token) {
      const decodedToken = jwtDecode<JwtPayload>(token);
      if(decodedToken) {

        if(!this.isExpired(decodedToken?.exp)) {
          console.log("NOT EXPIRED");
          this.decodedTokenPayload = decodedToken;
          this.token = token;

          const username = this.decodedTokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
          if(username)
            this._userSubject$.next(username);
      
        }
        else
          console.log("EXPIRED!");
      }
    }
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////

  private isExpired(expirationSecondsSinceEpoch: number): boolean {
    console.log("expirationSecondsSinceEpoch: ", expirationSecondsSinceEpoch);
    if(!expirationSecondsSinceEpoch) return true;
    return expirationSecondsSinceEpoch < this.getSecondsSinceEpoch();
  }

  private getSecondsSinceEpoch(): number {
    //Hat tip to https://futurestud.io/tutorials/get-number-of-seconds-since-epoch-in-javascript
    const now = new Date();
    const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);
    console.log("utcSecondsSinceEpoch: ", utcSecondsSinceEpoch);
    return utcSecondsSinceEpoch;
  }

}
