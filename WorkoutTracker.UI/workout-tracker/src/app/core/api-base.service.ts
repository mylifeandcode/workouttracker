import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Entity } from 'app/shared/models/entity';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, mergeMap, shareReplay, tap } from 'rxjs/operators';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

export abstract class ApiBaseService<T extends Entity> {

  /*
  This BehaviorSubject is here for us to call next() on, which will trigger a new call to 
  get all of the objects from the API for the specifed type. We'll do this if the user changes 
  any of the objects (add, update, delete) so that we can invalidate the cached Observable.
  */
  protected _refreshGetAll = new BehaviorSubject<void>(undefined);

  constructor(protected _apiRoot: string, protected _http: HttpClient) {}

  //PUBLIC FIELDS /////////////////////////////////////////////////////////////
  /*
  This Observable gets set when _refreshGetAll emits (via next()) which triggers
  a call to getAllFromAPI(), and uses shareReplay() to cache the response.
  */
  public all: Observable<T[]> = this._refreshGetAll
    .pipe(
      tap(() => { console.log("GOT ALL DATA")}),
      mergeMap(() => this.getAllFromAPI()),
      shareReplay(1) //Without this, the call was getting made each time
    );
  //END PUBLIC FIELDS /////////////////////////////////////////////////////////

  //PUBLIC METHODS ////////////////////////////////////////////////////////////
  public getAll(): Observable<T[]> {
    return from(this.all);
  }

  public getById(id: number): Observable<T> {
    return this._http.get<T>(`${this._apiRoot}/${id}`);
  }

  public add(value: T): Observable<T> {
    return this._http.post<T>(this._apiRoot, value, HTTP_OPTIONS)
      .pipe(
        tap(() => this._refreshGetAll.next()) //Because we've added an object, we need to trigger a change to invalidate the cached Observable of all of the objects
      );
  }

  public update(value: T): Observable<T> {
    return this._http.put<T>(`${this._apiRoot}/${value.id}`, value, HTTP_OPTIONS)
      .pipe(
        tap(() => this._refreshGetAll.next()) //Because we've updated an object, we need to trigger a change to invalidate the cached Observable of all of the objects
      );
  }

  public delete(id: number): Observable<any> { //TODO: Re-evaluate use of "any" type here
    return this._http.delete(`${this._apiRoot}/${id}`)
      .pipe(
        tap(() => this._refreshGetAll.next()) //Because we've deleted an object, we need to trigger a change to invalidate the cached Observable of all of the objects
      );
  }
  //END PUBLIC METHODS ////////////////////////////////////////////////////////

  //PRIVATE METHODS ///////////////////////////////////////////////////////////
  private getAllFromAPI(): Observable<T[]> {
    return this._http.get<T[]>(this._apiRoot)
      .pipe(tap(item => console.log(`Got data from ${this._apiRoot}: `, item)));
  }

  private handleError(err: any): Observable<any> {
    //TODO: Implement this to do something meaningful/useful
    console.log("Error in ApiBaseService: ", err);
    return throwError(err);
  }
  //END PRIVATE METHODS ///////////////////////////////////////////////////////
}
