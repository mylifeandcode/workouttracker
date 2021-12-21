import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'app/core/api-base.service';
import { ConfigService } from 'app/core/config.service';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExecutedWorkout } from './models/executed-workout';
import { ExecutedWorkoutDTO } from './models/executed-workout-dto';
import { WorkoutDTO } from './models/workout-dto';

@Injectable({
  providedIn: 'root'
})
export class ExecutedWorkoutService extends ApiBaseService<ExecutedWorkout> {

  constructor(private _configService: ConfigService, _http: HttpClient) {
    super(_configService.get('apiRoot') + "executedworkout", _http);
  }

  /**
   * Gets a subset of ExecutedWorkoutDTOs
   *
   * @param userId The ID of the user to get ExecutedWorkoutDTOs for.
   * @param startingIndex The index of the record to start with.
   * @param pageSize The number of records to return. Could be less if on the final page.
   */

  //TODO: Refactor. Get user ID in API from token.
  public getFilteredSubset(startingIndex: number, pageSize: number): Observable<PaginatedResults<ExecutedWorkoutDTO>> {
    return this._http.get<PaginatedResults<ExecutedWorkoutDTO>>(`${this._apiRoot}?firstRecord=${startingIndex}&pageSize=${pageSize}`);
  }

  /**
   * Gets recently executed workouts
   * @returns an array of recently executed workouts
   */
  //TODO: Refactor. Get user ID in API from token.
  public getRecent(): Observable<ExecutedWorkoutDTO[]> {
    return this.getFilteredSubset(0, 5)
      .pipe(map((results: PaginatedResults<ExecutedWorkoutDTO>) => results.results));
  }
}
