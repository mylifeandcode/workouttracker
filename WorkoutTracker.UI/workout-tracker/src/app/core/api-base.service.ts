import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Entity } from 'app/shared/models/entity';
import { concat } from 'lodash';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { concatMap, exhaustMap, mergeMap, mergeMapTo, shareReplay, switchMap, switchMapTo, take, tap } from 'rxjs/operators';

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
  /** 
   * An Observable containing all of the specified type of entity.
   * Use this if you want live updates. The data is cached unless changes are made, in 
   * which case the cache is refreshed. This Observable doesn't complete so you'll need to 
   * unsubscribe from it.
  */
  public all: Observable<T[]> = this._refreshGetAll
    .pipe(
      tap(() => { console.log("GOT ALL DATA")}),
      mergeMap(() => this.getAllFromAPI()),
      shareReplay(1) //Without this, the call was getting made each time
    );
  //END PUBLIC FIELDS /////////////////////////////////////////////////////////

  //PUBLIC METHODS ////////////////////////////////////////////////////////////
  /**
   * Gets all of the specified type of entity. Emits the value and completes.
   * @returns An Observable containing an array of all of the specified type of entity which 
   * completes after the value is emitted. Value is cached, and refreshed when changes are made 
   * or a call is made to invalidate the cache. Use this instead of the all Observable when you 
   * want an Observable which will complete once the value is emitted.
   */
  public getAll(): Observable<T[]> {
    return this.all.pipe(take(1)); //Originally was using from() here, but despite that, the output Observable would not complete.
  }

  /**
   * Gets the specified entity by ID.
   * @param id The ID of the entity to retrieve.
   * @returns An Observable containing the specified entity which completes after the value is 
   * emitted. This value is not cached.
   */
  public getById(id: number): Observable<T> {
    return this._http.get<T>(`${this._apiRoot}/${id}`);
  }

  /**
   * Adds the provided entity and invalidates the cache.
   * @param value The entity to add.
   * @returns An Observable containing the added entity which completes after its value is emitted.
   */
  public add(value: T): Observable<T> {
    return this._http.post<T>(this._apiRoot, value, HTTP_OPTIONS)
      .pipe(
        tap(() => this._refreshGetAll.next()) //Because we've added an object, we need to trigger a change to invalidate the cached Observable of all of the objects
      );
  }

  /**
   * Updates the provided entity and invalidates the cache.
   * @param value The entity to update.
   * @returns An Observable containing the updated entity which completes after its value is emitted.
   */
   public update(value: T): Observable<T> {
    return this._http.put<T>(`${this._apiRoot}/${value.id}`, value, HTTP_OPTIONS)
      .pipe(
        tap(() => this._refreshGetAll.next()) //Because we've updated an object, we need to trigger a change to invalidate the cached Observable of all of the objects
      );
  }

  /**
   * Deletes the specified entity and invalidates the cache.
   * @param id The ID of the entity to delete.
   * @returns The response from the API to the DELETE request.
   */
  public delete(id: number): Observable<any> { //TODO: Re-evaluate use of "any" type here, should probably be HttpResponse.
    return this._http.delete(`${this._apiRoot}/${id}`)
      .pipe(
        tap(() => this._refreshGetAll.next()) //Because we've deleted an object, we need to trigger a change to invalidate the cached Observable of all of the objects
      );
  }
  //END PUBLIC METHODS ////////////////////////////////////////////////////////

  //PRIVATE METHODS ///////////////////////////////////////////////////////////
  /**
   * Gets all of the entities from the API.
   * @returns An Observable containing all of the entities which completes after the value is emitted.
   */
  private getAllFromAPI(): Observable<T[]> {
    return this._http.get<T[]>(this._apiRoot)
      .pipe(tap(item => console.log(`Got data from ${this._apiRoot}: `, item)));
  }

  /**
   * Handles an error.
   * @param err The error.
   * @returns An Observable that emits no items to the Observer and immediately emits an error notification.
   */
  private handleError(err: any): Observable<never> {
    //TODO: Implement this to do something meaningful/useful
    console.log("Error in ApiBaseService: ", err);
    return throwError(err);
  }
  //END PRIVATE METHODS ///////////////////////////////////////////////////////
}
