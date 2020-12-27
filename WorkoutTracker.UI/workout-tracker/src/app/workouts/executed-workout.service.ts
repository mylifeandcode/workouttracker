import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'app/core/api-base.service';
import { ConfigService } from 'app/core/config.service';
import { Observable } from 'rxjs';
import { ExecutedWorkout } from './models/executed-workout';

@Injectable({
  providedIn: 'root'
})
export class ExecutedWorkoutService extends ApiBaseService<ExecutedWorkout> {

  constructor(private _configService: ConfigService, _http: HttpClient) {
    super(_configService.get('apiRoot') + "executedworkout", _http);
  }

  /**
   * Gets a new ExecutedWorkout to be used for the specified Workout
   * @param workoutId The ID of the Workout to get a new ExecutedWorkout for
   */
  public getNew(workoutId: number): Observable<ExecutedWorkout> {
    return this._http.get<ExecutedWorkout>(`${this._apiRoot}/new/${workoutId}`);
  }
}
