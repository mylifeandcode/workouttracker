import { Injectable, inject } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Workout } from 'app/workouts/_models/workout';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { WorkoutDTO } from 'app/workouts/_models/workout-dto';
import { WorkoutPlan } from '../_models/workout-plan';
import { ConfigService } from 'app/core/_services/config/config.service';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);

  private readonly API_ROOT: string;

  constructor() { 
    this.API_ROOT = this._configService.get("apiRoot") + "workouts";
  }

  public getFilteredSubset(
    firstRecOffset: number, 
    pageSize: number, 
    activeOnly: boolean, 
    sortAscending: boolean = true, 
    nameContains: string | null = null): Observable<PaginatedResults<WorkoutDTO>> {
        
    let url: string = `${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}&activeOnly=${activeOnly}&sortAscending=${sortAscending}`;

    if(nameContains)
        url += `&nameContains=${nameContains}`;

    return this._http.get<PaginatedResults<WorkoutDTO>>(url);
  }

  public getById(id: string): Observable<Workout> {
    return this._http.get<Workout>(`${this.API_ROOT}/${id}`);
  }

  public add(workout: Workout): Observable<Workout> {
    return this._http.post<Workout>(this.API_ROOT, workout, HTTP_OPTIONS);
  }

  public update(workout: Workout): Observable<Workout> {
    return this._http.put<Workout>(this.API_ROOT, workout, HTTP_OPTIONS);
  }

  public getNewPlan(workoutPublicId: string): Observable<WorkoutPlan> {
    return this._http
      .get<WorkoutPlan>(`${this.API_ROOT}/${workoutPublicId}/plan`)
      .pipe(
        map((plan) => {
          if (plan.submittedDateTime) {
            plan.submittedDateTime = new Date(plan.submittedDateTime);
          }
          return plan;
        })
      );
  }

  public submitPlan(plan: WorkoutPlan): Observable<string> {
    return this._http.post<string>(`${this.API_ROOT}/plan`, plan);
  }

  public submitPlanForLater(plan: WorkoutPlan): Observable<string> {
    return this._http.post<string>(`${this.API_ROOT}/plan-for-later`, plan);
  }

  public submitPlanForPast(plan: WorkoutPlan, startDateTime: Date, endDateTime: Date): Observable<string> {
    return this._http.post<string>(`${this.API_ROOT}/plan-for-past/${startDateTime.toISOString()}/${endDateTime.toISOString()}`, plan);
  }

  public retire(publicId: string): Observable<HttpResponse<void>> {
    return this._http.put<HttpResponse<void>>(`${this.API_ROOT}/${publicId}/retire`, null);
  }

  public reactivate(publicId: string): Observable<HttpResponse<void>> {
    return this._http.put<HttpResponse<void>>(`${this.API_ROOT}/${publicId}/reactivate`, null);
  }  
}
