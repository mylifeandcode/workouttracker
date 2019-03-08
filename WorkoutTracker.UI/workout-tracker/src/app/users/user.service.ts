import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';
import { map } from 'rxjs/operators';
import { CookieService } from 'ng2-cookies';

@Injectable()
export class UserService {

  private _rootUrl: string = "http://localhost:5600/api/Users";
  private _currentUser: User = null;
  private readonly COOKIE_NAME = "WorkoutTracker";

  constructor(private _http: Http, private _cookieSvc: CookieService) { } //TODO: Refactor to use HttpClient instead of Http

  public getAll() : Observable<Array<User>> {
    return this._http.get(this._rootUrl)
      .pipe(map((resp: Response) => resp.json()));
  }

  public getCurrentUserInfo(): Observable<User> {
    console.log("this._currentUser", this._currentUser);
    if (this._currentUser)
      return of(this._currentUser);

    let userId = this._cookieSvc.get(this.COOKIE_NAME);
    if (userId) {
      return this.getUserInfo(parseInt(userId))
        .pipe(map((user: User) => {
          this.setCurrentUser(user);
          return user;
        }));
    }
    else
      return of(null);
  }

  public getUserInfo(userId: number): Observable<User> {
    return this._http.get(`${this._rootUrl}/${userId}`)
      .pipe(map((resp: Response) => resp.json()));
  }

  public addUser(user: User): Observable<User> {
    console.log("USER = ", user);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this._http.post(this._rootUrl, user)
      .pipe(map((resp: Response) => resp.json()));

  }

  public updateUser(user: User): Observable<User> {
    return this._http.put(this._rootUrl, user)
      .pipe(map((resp: Response) => resp.json()));
  }

  public deleteUser(userId: number): Observable<Response> {
    return this._http.delete(`${this._rootUrl}/${userId}`);
  }

  public setCurrentUser(user: User): void {
    this._cookieSvc.set(this.COOKIE_NAME, user.id.toString());
    this._currentUser = user;
  }
}