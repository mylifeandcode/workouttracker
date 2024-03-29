import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workout } from 'app/workouts/models/workout';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResults } from '../core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { WorkoutPlan } from './models/workout-plan';
import { ConfigService } from 'app/core/services/config/config.service';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {

  private readonly API_ROOT: string;

  constructor(private _http: HttpClient, private _configService: ConfigService) { 
    this.API_ROOT = this._configService.get("apiRoot") + "workouts";
  }

  public getFilteredSubset(firstRecOffset: number, pageSize: number, activeOnly: boolean, nameContains: string | null = null): Observable<PaginatedResults<WorkoutDTO>> {
        
    let url: string = `${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}&activeOnly=${activeOnly}`;

    if(nameContains)
        url += `&nameContains=${nameContains}`;

    return this._http.get<PaginatedResults<WorkoutDTO>>(url);
  }

  public getById(id: number): Observable<Workout> {
    return this._http.get<Workout>(`${this.API_ROOT}/${id}`);
  }

  /*
  public getDTObyId(id: number): Observable<WorkoutDTO> {
    return this._http.get<WorkoutDTO>(`${this.API_ROOT}/DTO/${id}`);
  }
  */

  public getByUserId(id: number): Observable<WorkoutDTO[]> {
    return this._http.get<WorkoutDTO[]>(`${this.API_ROOT}/user/${id}`);
  }

  public add(workout: Workout): Observable<Workout> {
    return this._http.post<Workout>(this.API_ROOT, workout, HTTP_OPTIONS);
  }

  public update(workout: Workout): Observable<Workout> {
    return this._http.put<Workout>(`${this.API_ROOT}/${workout.id}`, workout, HTTP_OPTIONS);
  }

  public getPlan(workoutId: number): Observable<WorkoutPlan> {
    return this._http.get<WorkoutPlan>(`${this.API_ROOT}/${workoutId}/plan`);
  }

  public submitPlan(plan: WorkoutPlan): Observable<number> {
    return this._http.post<number>(`${this.API_ROOT}/${plan.workoutId}/plan`, plan);
  }

  public submitPlanForLater(plan: WorkoutPlan): Observable<number> {
    return this._http.post<number>(`${this.API_ROOT}/${plan.workoutId}/plan-for-later`, plan);
  }

  public submitPlanForPast(plan: WorkoutPlan, startDateTime: Date, endDateTime: Date): Observable<number> {
    return this._http.post<number>(`${this.API_ROOT}/${plan.workoutId}/plan-for-past/${startDateTime.toISOString()}/${endDateTime.toISOString()}`, plan);
  }

  public retire(id: number): Observable<HttpResponse<any>> {
    return this._http.put<HttpResponse<any>>(`${this.API_ROOT}/${id}/retire`, null);
  }

  public reactivate(id: number): Observable<HttpResponse<any>> {
    return this._http.put<HttpResponse<any>>(`${this.API_ROOT}/${id}/reactivate`, null);
  }  
}
