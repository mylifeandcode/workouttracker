import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { User } from '../../_models/user';
import { map, tap } from 'rxjs/operators';
import { UserOverview } from '../../_models/user-overview';
import { ApiBaseService } from '../api-base/api-base.service';
import { UserNewDTO } from '../../_models/user-new-dto';


@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiBaseService<User> {

  constructor() {
    super("users");
  }

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public init(): void {
    //Race condition in app initializer prevents this from being done in constructor
    this._apiRoot = this._configService.get("apiRoot") + "users";
  }

  public getOverview(): Observable<UserOverview> {
    return this._http
      .get<UserOverview>(`${this._apiRoot}/overview`)
      .pipe(
        map((overview: UserOverview) => {
          if (overview.lastWorkoutDateTime) { 
            overview.lastWorkoutDateTime = new Date(overview.lastWorkoutDateTime);
          }
          return overview;
        })
      );
  }

  public addNew(user: UserNewDTO): Observable<User> {
    return this._http.post<User>(`${this._apiRoot}/new`, user).pipe(tap(() => { this.invalidateCache(); }));
  }

  public override add(user: User): Observable<never> {
    console.log("UserService.add() called - throwing error.", user); //HACK
    return throwError(() => "To add new users, use the addNew() method. UserService doesn't support the base add() method.");
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////
}
