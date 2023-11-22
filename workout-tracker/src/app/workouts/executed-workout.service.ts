import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'app/core/services/api-base.service';
import { ConfigService } from 'app/core/services/config.service';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { ExecutedExerciseDTO } from './models/executed-exercise-dto';
import { ExecutedWorkoutDTO } from './models/executed-workout-dto';
import { ExecutedWorkoutSummaryDTO } from './models/executed-workout-summary-dto';
import { groupBy } from 'lodash-es';
import { Dictionary } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ExecutedWorkoutService extends ApiBaseService<ExecutedWorkoutDTO> {

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
  public getFilteredSubset(startingIndex: number, pageSize: number): Observable<PaginatedResults<ExecutedWorkoutSummaryDTO>> {
    //TODO: Add parameters for filtering
    const result: Observable<PaginatedResults<ExecutedWorkoutSummaryDTO>> =
      this._http.get<PaginatedResults<ExecutedWorkoutSummaryDTO>>(`${this._apiRoot}?firstRecord=${startingIndex}&pageSize=${pageSize}`)
        .pipe(
          //tap(() => { console.log("Got executed workouts"); }), 
          shareReplay(1) //I need to read this for a better understanding: https://dev.to/this-is-angular/how-caching-data-in-angular-with-rxjs-27mj
        );
        
    return result;
  }

  /**
   * Gets planned ExecutedWorkouts
   * 
   * @param startingIndex The index of the record to start with.
   * @param pageSize The number of records to return. Could be less if on the final page.
   * @returns An Observable<PaginatedResults<ExecutedWorkoutDTO>> containing information about planned ExecutedWorkouts
   */
  public getPlanned(startingIndex: number, pageSize: number): Observable<PaginatedResults<ExecutedWorkoutSummaryDTO>> {
    return this._http.get<PaginatedResults<ExecutedWorkoutSummaryDTO>>(`${this._apiRoot}/planned?firstRecord=${startingIndex}&pageSize=${pageSize}`);
  }

  /**
   * Gets recently executed workouts
   * 
   * @returns an array of recently executed workouts
   */
  public getRecent(): Observable<ExecutedWorkoutSummaryDTO[]> {
    //TODO: Add parameter so we're not locked into getting 5 -- maybe users could increase this?
    return this.getFilteredSubset(0, 5)
      .pipe(map((response: PaginatedResults<ExecutedWorkoutSummaryDTO>) => response.results));
  }

  public groupExecutedExercises(exercises: ExecutedExerciseDTO[]): Dictionary<ExecutedExerciseDTO[]> {
    const sortedExercises: ExecutedExerciseDTO[] = exercises.sort((a: ExecutedExerciseDTO, b: ExecutedExerciseDTO) => a.sequence - b.sequence);
    
    const groupedExercises = groupBy(exercises, (exercise: ExecutedExerciseDTO) =>  
      exercise.exerciseId.toString() + '-' + exercise.setType.toString()
    );
    return groupedExercises;
  }

  public getInProgress(): Observable<ExecutedWorkoutSummaryDTO[]> {
    return this._http.get<ExecutedWorkoutSummaryDTO[]>(`${this._apiRoot}/in-progress`);
  }

  public deletePlanned(id: number): Observable<HttpResponse<any>> {
    return this._http.delete<HttpResponse<any>>(`${this._apiRoot}/planned/${id}`);
  }
}
