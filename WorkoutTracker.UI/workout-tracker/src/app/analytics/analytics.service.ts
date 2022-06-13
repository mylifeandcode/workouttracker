import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'app/core/config.service';
import { Observable } from 'rxjs';
import { ExecutedWorkoutsSummary } from './models/executed-workouts-summary';

//TODO: This service doesn't fit the normal API service pattern due to different types, not just 
//a single entity type. Find a way to eliminate duplicate setup code and allow for caching.

const HTTP_OPTIONS = { 
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_ROOT: string;

  constructor(private _http: HttpClient, private _configService: ConfigService) { 
    const apiRoot: string = this._configService.get("apiRoot");
    this.API_ROOT = apiRoot + "analytics";
  }

  public getExecutedWorkoutsSummary(): Observable<ExecutedWorkoutsSummary> {
    return this._http.get<ExecutedWorkoutsSummary>(`${this.API_ROOT}/executed-workouts`);
  }
}
