import { Injectable, Signal, inject } from '@angular/core';
import { HttpClient, httpResource, HttpResourceRef, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Workout, WorkoutDetailDTO, PaginatedResultsOfWorkoutDTO, WorkoutPlan } from '../../api';
import { ConfigService } from '../../core/_services/config/config.service';
import { HTTP_OPTIONS } from '../../shared/constants/http-constants';
import { DateSerializationService } from '../../core/_services/date-serialization/date-serialization.service';


@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);
  private _dateService = inject(DateSerializationService);

  private readonly API_ROOT: string;

  constructor() {
    this.API_ROOT = this._configService.get("apiRoot") + "workouts";
  }

  public getFilteredSubset(
    firstRecOffset: number,
    pageSize: number,
    activeOnly: boolean,
    sortAscending: boolean = true,
    nameContains: string | null = null): Observable<PaginatedResultsOfWorkoutDTO> {

    let url: string = `${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}&activeOnly=${activeOnly}&sortAscending=${sortAscending}`;

    if (nameContains)
      url += `&nameContains=${encodeURIComponent(nameContains)}`;

    return this._http.get<PaginatedResultsOfWorkoutDTO>(url);
  }

  public getSelection(
    firstRecOffset: Signal<number>,
    pageSize: Signal<number>,
    activeOnly: Signal<boolean>,
    sortAscending: Signal<boolean>,
    nameContains: Signal<string | null>): HttpResourceRef<PaginatedResultsOfWorkoutDTO> {

    return httpResource<PaginatedResultsOfWorkoutDTO>(
      () => {
        const params: Record<string, string | number | boolean> = {
          firstRecord: firstRecOffset(),
          pageSize: pageSize(),
          sortAscending: sortAscending(),
          activeOnly: activeOnly()
        };

        const name = nameContains();
        if (name)
          params['nameContains'] = name;

        return { url: this.API_ROOT, params };
      },
      {
        parse: (raw) => {//TODO: Consider using Zod for schema validation
          const paginatedResults = raw as PaginatedResultsOfWorkoutDTO;
          paginatedResults.results.forEach(workout => {
            this._dateService.convertAuditDateStringsToDates(workout);
          });
          return paginatedResults;
        },
        defaultValue: { results: [], totalCount: 0 }
      }

    );

  }

  public getById(id: string): Observable<WorkoutDetailDTO> {
    return this._http.get<WorkoutDetailDTO>(`${this.API_ROOT}/${id}`);
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
