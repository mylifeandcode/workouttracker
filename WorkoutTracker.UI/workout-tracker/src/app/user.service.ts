import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from './user';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class UserService {

  constructor() { }

  getAll() : Observable<Array<User>> {
    //TODO: Get real users from service
    let users = new Array<User>();
    users.push(new User());
    users[0].id = 1;
    users[0].name = "Some User";
    return Observable.of(users);
  }
}
