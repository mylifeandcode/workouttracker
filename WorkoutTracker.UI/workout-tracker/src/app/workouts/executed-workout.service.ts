import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'app/core/api-base.service';
import { ConfigService } from 'app/core/config.service';
import { PaginatedResults } from 'app/core/models/paginated-results';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExecutedExercise } from './models/executed-exercise';
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
   * Gets a subset of ExecutedWorkoutDTOs
   *
   * @param startingIndex The index of the record to start with.
   * @param pageSize The number of records to return. Could be less if on the final page.
   * @returns An Observable<PaginatedResults<ExecutedWorkoutDTO>> containing information about ExecutedWorkouts
   */
  public getFilteredSubset(startingIndex: number, pageSize: number): Observable<PaginatedResults<ExecutedWorkoutDTO>> {
    //TODO: Add parameters for filtering
    return this._http.get<PaginatedResults<ExecutedWorkoutDTO>>(`${this._apiRoot}?firstRecord=${startingIndex}&pageSize=${pageSize}`);
  }

  /**
   * Gets planned ExecutedWorkouts
   * 
   * @param startingIndex The index of the record to start with.
   * @param pageSize The number of records to return. Could be less if on the final page.
   * @returns An Observable<PaginatedResults<ExecutedWorkoutDTO>> containing information about planned ExecutedWorkouts
   */
  public getPlanned(startingIndex: number, pageSize: number): Observable<PaginatedResults<ExecutedWorkoutDTO>> {
    return this._http.get<PaginatedResults<ExecutedWorkoutDTO>>(`${this._apiRoot}/planned?firstRecord=${startingIndex}&pageSize=${pageSize}`);
  }

  /**
   * Gets recently executed workouts
   * @returns an array of recently executed workouts
   */
  public getRecent(): Observable<ExecutedWorkoutDTO[]> {
    //TODO: Add parameter so we're not locked into getting 5 -- maybe users could increase this?
    return this.getFilteredSubset(0, 5)
      .pipe(map((response: PaginatedResults<ExecutedWorkoutDTO>) => response.results));
  }

  public groupExecutedExercises(exercises: ExecutedExercise[]): _.Dictionary<ExecutedExercise[]> {
    const sortedExercises: ExecutedExercise[] = exercises.sort((a: ExecutedExercise, b: ExecutedExercise) => a.sequence - b.sequence);
    
    console.log("SORTED: ", sortedExercises);
    
    let groupedExercises = _.groupBy(exercises, (exercise: ExecutedExercise) => { 
      return exercise.exercise.id.toString() + '-' + exercise.setType.toString(); 
    });
    return groupedExercises;
  }
}
