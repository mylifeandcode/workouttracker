import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from '../../core/_services/api-base/api-base.service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ExecutedExerciseDTO } from '../_models/executed-exercise-dto';
import { ExecutedWorkoutDTO } from '../_models/executed-workout-dto';
import { ExecutedWorkoutSummaryDto, ExecutedWorkoutSummaryDtoPaginatedResults } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class ExecutedWorkoutService extends ApiBaseService<ExecutedWorkoutDTO> {

  constructor() {
    super("executedworkout");
  }

  /**
   * Gets a subset of ExecutedWorkoutDTOs
   *
   * @param startingIndex The index of the record to start with.
   * @param pageSize The number of records to return. Could be less if on the final page.
   * @returns An ExecutedWorkoutSummaryDtoPaginatedResults containing information about ExecutedWorkouts
   */
  public getFilteredSubset(
    startingIndex: number, 
    pageSize: number, 
    workoutNameContains: string | null = null,
    onlyWithJournalNotes: boolean = false): Observable<ExecutedWorkoutSummaryDtoPaginatedResults> {

    const result: Observable<ExecutedWorkoutSummaryDtoPaginatedResults> =
      this._http.get<ExecutedWorkoutSummaryDtoPaginatedResults>(`${this._apiRoot}?firstRecord=${startingIndex}&pageSize=${pageSize}${workoutNameContains ? '&workoutNameContains=' + workoutNameContains : ''}&onlyWithJournalNotes=${onlyWithJournalNotes}`)
        .pipe(
          map((response: ExecutedWorkoutSummaryDtoPaginatedResults) => {
            response.results = response.results?.map((ew: ExecutedWorkoutSummaryDto) => {
              ew = this._dateService.convertDateRangeStringsToDates(ew);
              return ew;
            });
            return response;
          }),
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
  public getPlanned(startingIndex: number, pageSize: number): Observable<ExecutedWorkoutSummaryDtoPaginatedResults> {
    return this._http
      .get<ExecutedWorkoutSummaryDtoPaginatedResults>(`${this._apiRoot}/planned?firstRecord=${startingIndex}&pageSize=${pageSize}`)
      .pipe(
        map((response: ExecutedWorkoutSummaryDtoPaginatedResults) => {
          response.results = response.results?.map((ew: ExecutedWorkoutSummaryDto) => {
            ew = this._dateService.convertDateRangeStringsToDates(ew);
            return ew;
          });
          return response;
        })
      );
  }

  /**
   * Gets recently executed workouts
   * 
   * @param pageSize The number of records to return.
   * @returns an array of recently executed workouts
   */
  public getRecent(pageSize: number = 5): Observable<ExecutedWorkoutSummaryDto[]> {
    return this.getFilteredSubset(0, pageSize)
      .pipe(map((response: ExecutedWorkoutSummaryDtoPaginatedResults) => { 
        response.results?.forEach((ew: ExecutedWorkoutSummaryDto) => this._dateService.convertDateRangeStringsToDates(ew));
        return response.results ?? []; 
      }));
  }

  public groupExecutedExercises(exercises: ExecutedExerciseDTO[]): Record<string, ExecutedExerciseDTO[]> {
    const sortedExercises: ExecutedExerciseDTO[] = exercises.sort((a: ExecutedExerciseDTO, b: ExecutedExerciseDTO) => a.sequence - b.sequence);

    const groupedExercises = sortedExercises.reduce((groups, exercise) => {
      const key = exercise.exerciseId.toString() + '-' + exercise.setType.toString();
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(exercise);
      
      return groups;
    }, {} as Record<string, ExecutedExerciseDTO[]>);

    return groupedExercises;
  }

  //public getInProgress(): Observable<ExecutedWorkoutSummaryDTO[]> {
  public getInProgress(): Observable<ExecutedWorkoutSummaryDto[]> {
    return this._http
      //.get<ExecutedWorkoutSummaryDTO[]>(`${this._apiRoot}/in-progress`)
      .get<ExecutedWorkoutSummaryDto[]>(`${this._apiRoot}/in-progress`)
      //.pipe(map((response: ExecutedWorkoutSummaryDTO[]) => {
      .pipe(map((response: ExecutedWorkoutSummaryDto[]) => {
        //response.forEach((ew: ExecutedWorkoutSummaryDTO) => this._dateService.convertDateRangeStringsToDates(ew));
        response.forEach((ew: ExecutedWorkoutSummaryDto) => this._dateService.convertDateRangeStringsToDates(ew));
        return response;
      }));
  }

  public deletePlanned(publicId: string): Observable<HttpResponse<void>> {
    return this._http.delete<HttpResponse<void>>(`${this._apiRoot}/planned/${publicId}`);
  }
}
