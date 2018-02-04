import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from './user';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class UserService {

  private _rootUrl: string = "http://localhost:5600/api/Users";

  constructor(private _http: Http) { }

  getAll() : Observable<Array<User>> {
    return this._http.get(this._rootUrl)
      .map((resp: Response) => resp.json());
  }

  getUserInfoFromCookie() : User {
    //TODO: Implement
    return new User();
  }

  getUserInfo(userId: number): Observable<User> {
    return this._http.get(`${this._rootUrl}/${userId}`)
      .map((resp: Response) => resp.json());
  }

}
