import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from './models/user';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private readonly LOCAL_STORAGE_KEY = "WorkoutTrackerUser";

  private _rootUrl: string = "http://localhost:5600/api/Users"; //TODO: Get from config service
  private _userSubject$ = new BehaviorSubject<User>(null);
  private _userObservable$: Observable<User> = this._userSubject$.asObservable();

  constructor(private _http: HttpClient, private _localStorageService: LocalStorageService) { }

  
  //PROPERTIES ////////////////////////////////////////////////////////////////

  public get currentUserId(): number {
    if (!this.isUserLoggedIn())
      throw new Error("No user is currently logged in.");

    return this._userSubject$.value?.id;
  }

  public get currentUserInfo(): Observable<User> {
    return this._userObservable$;
  }

  //END PROPERTIES ////////////////////////////////////////////////////////////


  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public getAll() : Observable<Array<User>> {
    return this._http.get<Array<User>>(this._rootUrl);
  }

  public getCurrentUserInfo(): Observable<User> {
    return of(this._userSubject$.value);
  }

  public getUserInfo(userId: number): Observable<User> {
    return this._http.get<User>(`${this._rootUrl}/${userId}`);
  }

  public addUser(user: User): Observable<User> {
    return this._http.post<User>(this._rootUrl, user, httpOptions);
  }

  public updateUser(user: User): Observable<User> {
    return this._http.put<User>(`${this._rootUrl}/${user.id}`, user, httpOptions);
  }

  public deleteUser(userId: number): Observable<any> {
    return this._http.delete(`${this._rootUrl}/${userId}`);
  }

  public isUserLoggedIn(): boolean {
    return (this._userSubject$.value != null);
  }

  public logIn(userId: number): Observable<User> {
    return this.getUserInfo(userId)
      .pipe(
        map((user: User) => {
          this._localStorageService.set(this.LOCAL_STORAGE_KEY, user);
          this._userSubject$.next(user);
          return user;
        }
      )
    );
  }

  public logOff(): void {
    this._localStorageService.remove(this.LOCAL_STORAGE_KEY);
    this._userSubject$.next(null);
  }

  public restoreUserSessionIfApplicable(): void {
    const user: User = this._localStorageService.get(this.LOCAL_STORAGE_KEY);
    if (user) {
      this._userSubject$.next(user);
    }
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////
}
