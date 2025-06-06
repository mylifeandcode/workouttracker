import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { User } from '../../_models/user';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { UserOverview } from '../../_models/user-overview';
import { ApiBaseService } from '../api-base/api-base.service';
import { UserNewDTO } from '../../_models/user-new-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiBaseService<User> {
  private _configService: ConfigService;


  constructor() {
    const _configService = inject(ConfigService);
    const _http = inject(HttpClient);
 
    super(_configService.get('apiRoot') + "users", _http);
    this._configService = _configService;

  }

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public init(): void {
    //Race condition in app initializer prevents this from being done in constructor
    this._apiRoot = this._configService.get("apiRoot") + "users";
  }

  public getOverview(): Observable<UserOverview> {
    return this._http.get<UserOverview>(`${this._apiRoot}/overview`);
  }

  public addNew(user: UserNewDTO): Observable<User> {
    return this._http.post<User>(`${this._apiRoot}/new`, user).pipe(tap((addedUser: User) => { this.invalidateCache(); }));
  }

  public override add(user: User): Observable<never> {
    return throwError(() => "To add new users, use the addNew() method. UserService doesn't support the base add() method.");
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////
}
