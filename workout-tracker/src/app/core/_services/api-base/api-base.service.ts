import { HttpClient, HttpResponse } from '@angular/common/http';
import { IEntity } from '../../../shared/interfaces/i-entity';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap, shareReplay, take, tap } from 'rxjs/operators';
import { DateSerializationService } from '../date-serialization/date-serialization.service';
import { inject } from '@angular/core';
import { IMightHaveAuditDates } from '../../../shared/interfaces/i-might-have-audit-dates';
import { ConfigService } from '../config/config.service';
import { HTTP_OPTIONS } from '../../../shared/http-constants';

export abstract class ApiBaseService<T extends IEntity & IMightHaveAuditDates> {

  /*
  This BehaviorSubject is here for us to call next() on, which will trigger a new call to 
  get all of the objects from the API for the specifed type. We'll do this if the user changes 
  any of the objects (add, update, delete) so that we can invalidate the cached Observable.
  */
  protected _refreshGetAll$ = new BehaviorSubject<void>(undefined);
  protected _dateService = inject(DateSerializationService);
  protected _http = inject(HttpClient);
  protected _configService = inject(ConfigService);
  protected _apiRoot: string;

  constructor(apiRootSuffix: string) { 
    this._apiRoot = this._configService.get('apiRoot') + apiRootSuffix;
  }

  //PUBLIC FIELDS /////////////////////////////////////////////////////////////
  /*
  This Observable gets set when _refreshGetAll emits (via next()) which triggers
  a call to getAllFromAPI(), and uses shareReplay() to cache the response.
  */
  /** 
   * An Observable containing all of the specified type of entity.
   * 
   * Use this if you want live updates. The data is cached unless changes are made, in 
   * which case the cache is refreshed. This Observable doesn't complete so you'll need to 
   * unsubscribe from it.
   */
  public all$: Observable<T[]> = this._refreshGetAll$
    .pipe(
      //tap(() => { console.log("GOT ALL DATA")}),
      mergeMap(() => this.getAllFromAPI()),
      shareReplay(1) //Without this, the call was getting made each time
      //This approach was described here: https://dev.to/this-is-angular/how-caching-data-in-angular-with-rxjs-27mj
    );
  //END PUBLIC FIELDS /////////////////////////////////////////////////////////

  //PUBLIC METHODS ////////////////////////////////////////////////////////////
  /**
   * Gets all of the specified type of entity. Emits the value and completes.
   * 
   * @returns An Observable containing an array of all of the specified type of entity which 
   * completes after the value is emitted. Value is cached, and refreshed when changes are made 
   * or a call is made to invalidate the cache. Use this instead of the all Observable when you 
   * want an Observable which will complete once the value is emitted.
   * WARNING: Due to timing considerations with the way the cache refreshes, this value may 
   * not reflect the true state of the data if called directly after an add, update, or delete.
   */
  public getAll(fromCache: boolean = true): Observable<T[]> {
    if (fromCache) {
      //console.log("GETTING ALL FROM CACHE");
      return this.all$.pipe(take(1)); //Originally was using from() here, but despite that, the output Observable would not complete.
    }
    else {
      //console.log("GETTING ALL FROM API");
      return this.getAllFromAPI();
    }
  }

  /**
   * Gets the specified entity by public ID.
   * 
   * @param publicId The public ID of the entity to retrieve.
   * @returns An Observable containing the specified entity which completes after the value is 
   * emitted. This value is not cached.
   */
  public getById(publicId: string): Observable<T> {
    return this._http
      .get<T>(`${this._apiRoot}/${publicId}`)
      .pipe(
        map((item: T) => {
          this._dateService.convertAuditDateStringsToDates(item);
          return item;
        })
      );
  }

  /**
   * Adds the provided entity and invalidates the cache.
   * 
   * @param value The entity to add.
   * @returns An Observable containing the added entity which completes after its value is emitted.
   */
  public add(value: T): Observable<T> {
    return this._http.post<T>(this._apiRoot, value, HTTP_OPTIONS)
      .pipe(
        tap(() => this.invalidateCache()), //Because we've added an object, we need to trigger a change to invalidate the cached Observable of all of the objects
        map((item: T) => {
          this._dateService.convertAuditDateStringsToDates(item);
          return item;
        })
      );
  }

  /**
   * Updates the provided entity and invalidates the cache.
   * 
   * @param value The entity to update.
   * @returns An Observable containing the updated entity which completes after its value is emitted.
   */
  public update(value: T): Observable<T> {
    return this._http.put<T>(`${this._apiRoot}/${value.id}`, value, HTTP_OPTIONS)
      .pipe(
        tap(() => this.invalidateCache()), //Because we've updated an object, we need to trigger a change to invalidate the cached Observable of all of the objects
        map((item: T) => {
          this._dateService.convertAuditDateStringsToDates(item);
          return item;
        })
      );
  }

  /**
   * Deletes the specified entity and invalidates the cache.
   * 
   * @param id The ID of the entity to delete.
   * @returns The response from the API to the DELETE request.
   */
  public delete(id: number): Observable<HttpResponse<void>> { //TODO: Re-evaluate use of "any" type here, should probably be HttpResponse.
    //console.log("DELETING");
    return this._http.delete<HttpResponse<void>>(`${this._apiRoot}/${id}`)
      .pipe(
        tap(() => this.invalidateCache()) //Because we've deleted an object, we need to trigger a change to invalidate the cached Observable of all of the objects
      );
  }

  //TODO: Replace the delete() method above with the one below, which uses the publicId instead of the id.

  /**
   * Deletes the specified entity and invalidates the cache.
   * 
   * @param publicId The public ID of the entity to delete.
   * @returns The response from the API to the DELETE request.
   */
  public deleteById(publicId: string): Observable<HttpResponse<void>> { 
    //console.log("DELETING");
    return this._http.delete<HttpResponse<void>>(`${this._apiRoot}/${publicId}`)
      .pipe(
        tap(() => this.invalidateCache()) //Because we've deleted an object, we need to trigger a change to invalidate the cached Observable of all of the objects
      );
  }

  /**
   * Invalidates cached data
   */
  public invalidateCache(): void {
    //console.log("Invalidating cache");
    this._refreshGetAll$.next();
  }
  //END PUBLIC METHODS ////////////////////////////////////////////////////////

  //PRIVATE METHODS ///////////////////////////////////////////////////////////
  /**
   * Gets all of the entities from the API.
   * 
   * @returns An Observable containing all of the entities which completes after the value is emitted.
   */
  private getAllFromAPI(): Observable<T[]> {
    return this._http
      .get<T[]>(this._apiRoot)
      .pipe(
        map((items: T[]) => {
          items.forEach(item => this._dateService.convertAuditDateStringsToDates(item));
          return items;
        })
      );
  }
  //END PRIVATE METHODS ///////////////////////////////////////////////////////
}
