import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, UserOverview } from '../../../api';
import { ApiBaseService } from '../api-base/api-base.service';
import { PasswordResetTokenDTO, UserNewDTO, UserSettingsUpdateDTO, UserUpdateDTO } from '../../../api';
import { HTTP_OPTIONS } from '../../../shared/constants/http-constants';


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

  /**
   * Administrators only. Changes a user's name, email address and role, and nothing else about them.
   */
  public updateUser(publicId: string, user: UserUpdateDTO): Observable<void> {
    return this._http
      .put<void>(`${this._apiRoot}/${publicId}`, user, HTTP_OPTIONS)
      .pipe(tap(() => { this.invalidateCache(); }));
  }

  /**
   * Saves the signed-in user's own settings. There is no user id in this call: the API applies it to whoever is signed in.
   */
  public updateMySettings(settings: UserSettingsUpdateDTO): Observable<void> {
    return this._http.put<void>(`${this._apiRoot}/me/settings`, settings, HTTP_OPTIONS);
  }

  /**
   * Administrators only. The "delete" of a user: they can no longer sign in and their sessions end, but their data is kept.
   */
  public deactivate(publicId: string): Observable<void> {
    return this._http
      .put<void>(`${this._apiRoot}/${publicId}/deactivate`, {}, HTTP_OPTIONS)
      .pipe(tap(() => { this.invalidateCache(); }));
  }

  /**
   * Administrators only. Lets a deactivated user sign in again.
   */
  public reactivate(publicId: string): Observable<void> {
    return this._http
      .put<void>(`${this._apiRoot}/${publicId}/reactivate`, {}, HTTP_OPTIONS)
      .pipe(tap(() => { this.invalidateCache(); }));
  }

  /**
   * Administrators only, for installations that can't send email: creates a one-time reset token for a user, to hand to them.
   * The token is shown once and expires.
   */
  public createPasswordReset(publicId: string): Observable<PasswordResetTokenDTO> {
    return this._http.post<PasswordResetTokenDTO>(`${this._apiRoot}/${publicId}/password-reset`, {}, HTTP_OPTIONS);
  }

  public override add(user: User): Observable<never> {
    console.log("UserService.add() called - throwing error.", user); //HACK
    return throwError(() => new Error("To add new users, use the addNew() method. UserService doesn't support the base add() method."));
  }

  //The inherited update/delete calls hit API routes that no longer exist (they took the whole user entity). Failing loudly
  //here is better than quietly calling a dead route.
  public override update(user: User): Observable<never> {
    console.log("UserService.update() called - throwing error.", user); //HACK
    return throwError(() => new Error("To change a user, use updateUser() (administrators) or updateMySettings(). UserService doesn't support the base update() method."));
  }

  public override delete(id: number): Observable<never> {
    console.log("UserService.delete() called - throwing error.", id); //HACK
    return throwError(() => new Error("Users are deactivated, not deleted. Use deactivate()."));
  }

  public override deleteById(publicId: string): Observable<never> {
    console.log("UserService.deleteById() called - throwing error.", publicId); //HACK
    return throwError(() => new Error("Users are deactivated, not deleted. Use deactivate()."));
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////
}
