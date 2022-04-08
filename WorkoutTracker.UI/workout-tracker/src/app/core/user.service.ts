import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from './models/user';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { ConfigService } from './config.service';
import { UserOverview } from './models/user-overview';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private _apiRoot: string;
  private _userSubject$ = new BehaviorSubject<User | null>(null);
  //private _userObservable$: Observable<User> = this._userSubject$.asObservable();

  constructor(
    private _http: HttpClient, 
    private _configService: ConfigService) { 

  }

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public init(): void {
    //Race condition in app initializer prevents this from being done in constructor
    this._apiRoot = this._configService.get("apiRoot") + "Users";
  }

  public getAll() : Observable<Array<User>> {
    return this._http.get<Array<User>>(this._apiRoot);
  }

  public getUserInfo(userId: number): Observable<User> {
    return this._http.get<User>(`${this._apiRoot}/${userId}`);
  }

  public addUser(user: User): Observable<User> {
    return this._http.post<User>(this._apiRoot, user, httpOptions);
  }

  public updateUser(user: User): Observable<User> {
    return this._http.put<User>(`${this._apiRoot}/${user.id}`, user, httpOptions);
  }

  public deleteUser(userId: number): Observable<any> {
    return this._http.delete(`${this._apiRoot}/${userId}`);
  }

  //TODO: Move to AuthService
  public isUserLoggedIn(): boolean {
    return (this._userSubject$.value != null);
  }

  public getOverview(): Observable<UserOverview> {
    return this._http.get<UserOverview>(`${this._apiRoot}/overview`);
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////
}
