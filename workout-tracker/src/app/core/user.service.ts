import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from './models/user';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { ConfigService } from './config.service';
import { UserOverview } from './models/user-overview';
import { ApiBaseService } from './api-base.service';
import { UserNewDTO } from './models/user-new-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiBaseService<User> {

  //private _apiRoot: string;
  private _userSubject$ = new BehaviorSubject<User | null>(null);
  //private _userObservable$: Observable<User> = this._userSubject$.asObservable();

  constructor(private _configService: ConfigService, _http: HttpClient) { 
    super(_configService.get('apiRoot') + "Users", _http);
  }

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public init(): void {
    //Race condition in app initializer prevents this from being done in constructor
    this._apiRoot = this._configService.get("apiRoot") + "Users";
  }

  public getOverview(): Observable<UserOverview> {
    return this._http.get<UserOverview>(`${this._apiRoot}/overview`);
  }

  public addNew(user: UserNewDTO): Observable<User> {
    return this._http.post<User>(`${this._apiRoot}/new`, user).pipe(tap((addedUser: User) => { this.invalidateCache(); }));
  }

  public override add(user: User): Observable<never> {
    return throwError("To add new users, use the addNew() method. UserService doesn't support the base add() method.");
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////
}
