import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Entity } from 'app/shared/models/entity';
import { Observable } from 'rxjs';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

export abstract class ApiBaseService<T extends Entity> {

    constructor(protected _apiRoot: string, protected _http: HttpClient) {}

    public getAll(): Observable<T[]> {
      return this._http.get<T[]>(this._apiRoot);
    }

    public getById(id: number): Observable<T> {
      return this._http.get<T>(`${this._apiRoot}/${id}`);
    }

    public add(value: T): Observable<T> {
      return this._http.post<T>(this._apiRoot, value, HTTP_OPTIONS);
    }

    public update(value: T): Observable<T> {
      return this._http.put<T>(`${this._apiRoot}/${value.id}`, value, HTTP_OPTIONS);
    }

    public delete(id: number): Observable<any> { //TODO: Re-evaluate use of "any" type here
      return this._http.delete(`${this._apiRoot}/${id}`);
    }

}
