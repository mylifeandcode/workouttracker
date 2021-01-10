import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'app/core/api-base.service';
import { ConfigService } from 'app/core/config.service';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { Observable } from 'rxjs';
import { ExecutedWorkout } from './models/executed-workout';
import { ExecutedWorkoutDTO } from './models/executed-workout-dto';

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

  /**
   * Gets a subset of ExecutedWorkoutDTOs
   * @param userId The ID of the user to get ExecutedWorkoutDTOs for.
   * @param startingIndex The index of the record to start with.
   * @param pageSize The number of records to return. Could be less if on the final page.
   */
  public getFilteredSubset(userId: number, startingIndex: number, pageSize: number): Observable<PaginatedResults<ExecutedWorkoutDTO>> {
    return this._http.get<PaginatedResults<ExecutedWorkoutDTO>>(`${this._apiRoot}?userId=${userId}&firstRecord=${startingIndex}&pageSize=${pageSize}`);
  }
}
