import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workout } from 'app/models/workout';
import { map, catchError } from 'rxjs/operators';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {

  private readonly API_ROOT: string = "http://localhost:5600/api/workouts"; //TODO: Get from environment config

  constructor(private _http: HttpClient) { }

  public getById(id: number): Observable<Workout> {
    return this._http.get(`${this.API_ROOT}/${id}`)
      .pipe(map((resp: Workout) => resp));
  }

  public add(workout: Workout): Observable<Workout> {
    return this._http.post(this.API_ROOT, workout, HTTP_OPTIONS)
      .pipe(map((response: Workout) => response));
  }

  public update(workout: Workout): Observable<Workout> {
    return this._http.put(this.API_ROOT, workout, HTTP_OPTIONS)
      .pipe(map((response: Workout) => response));
  }
}
