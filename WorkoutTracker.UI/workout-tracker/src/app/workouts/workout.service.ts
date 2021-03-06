import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workout } from 'app/workouts/models/workout';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResults } from '../core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';

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

  public getAll(firstRecOffset: number, pageSize: number, userId: number, nameContains: string = null): Observable<PaginatedResults<WorkoutDTO>> {
        
    let url: string = `${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}&userId=${userId}`;

    if(nameContains)
        url += `&nameContains=${nameContains}`;

    return this._http
        .get(url)
        .pipe(map((resp: PaginatedResults<WorkoutDTO>) => resp));
  }

  public getById(id: number): Observable<Workout> {
    return this._http.get(`${this.API_ROOT}/${id}`)
      .pipe(map((resp: Workout) => resp));
  }

  public getDTObyId(id: number): Observable<WorkoutDTO> {
    return this._http.get<WorkoutDTO>(`${this.API_ROOT}/DTO/${id}`);
  }

  public getByUserId(id: number): Observable<WorkoutDTO[]> {
    return this._http.get(`${this.API_ROOT}/user/${id}`)
      .pipe(map((resp: WorkoutDTO[]) => resp));
  }

  public add(workout: Workout): Observable<Workout> {
    return this._http.post(this.API_ROOT, workout, HTTP_OPTIONS)
      .pipe(map((response: Workout) => response));
  }

  public update(workout: Workout): Observable<Workout> {
    return this._http.put(`${this.API_ROOT}/${workout.id}`, workout, HTTP_OPTIONS)
      .pipe(map((response: Workout) => response));
  }
}
