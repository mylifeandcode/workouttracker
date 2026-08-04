import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { PaginatedResultsOfExerciseDTO } from '../../api';
import { Exercise } from '../../api';
import { ConfigService } from '../../core/_services/config/config.service';
import { DateSerializationService } from '../../core/_services/date-serialization/date-serialization.service';
import { HTTP_OPTIONS } from '../../shared/constants/http-constants';


@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);
  private _dateService = inject(DateSerializationService);


  private readonly API_ROOT: string;
  private _resistanceTypes: Observable<Map<number, string>> | undefined;

  constructor() {
    this.API_ROOT = (this._configService.get("apiRoot") as string) + "exercises";
  }

  public getAll(
    firstRecOffset: number,
    pageSize: number,
    nameContains: string | null = null,
    targetAreaContains: string[] | null = null, 
    sortAscending: boolean = true): Observable<PaginatedResultsOfExerciseDTO> {

    let url: string = `${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}&sortAscending=${sortAscending}`;

    if (nameContains)
      url += `&nameContains=${nameContains}`;

    if (targetAreaContains) {
      const targetAreas = targetAreaContains.join(',');
      url += `&hasTargetAreas=${targetAreas}`;
    }

    return this._http
      .get<PaginatedResultsOfExerciseDTO>(url)
      .pipe(
        map((paginatedResults) => {
          paginatedResults.results.forEach(exercise => {
            this._dateService.convertAuditDateStringsToDates(exercise);
          });
          return paginatedResults;
        })
      );
  }

  public getById(publicId: string): Observable<Exercise> {
    return this._http
      .get<Exercise>(`${this.API_ROOT}/${publicId}`)
      .pipe(
        map((exercise) => {
          this._dateService.convertAuditDateStringsToDates(exercise);
          return exercise;
        })
      );
  }

  public add(exercise: Exercise): Observable<Exercise> {
    return this._http
      .post<Exercise>(this.API_ROOT, exercise, HTTP_OPTIONS)
      .pipe(
        map((newExercise) => {
          console.log('Received new exercise from API:', newExercise);
          this._dateService.convertAuditDateStringsToDates(newExercise);
          return newExercise;
        })
      );
  }

  public update(exercise: Exercise): Observable<Exercise> {
    return this._http
      .put<Exercise>(this.API_ROOT, exercise, HTTP_OPTIONS)
      .pipe(
        map((updatedExercise) => {
          this._dateService.convertAuditDateStringsToDates(updatedExercise);
          return updatedExercise;
        })
      );
  }

  public getResistanceTypes(): Observable<Map<number, string>> {
    if (!this._resistanceTypes)
      this._resistanceTypes = this._http
        .get<Map<number, string>>(`${this.API_ROOT}/ResistanceTypes`)
        .pipe(shareReplay(1)); //Without this, the call was getting made each time, because only the cold Observable was being held onto

    return this._resistanceTypes;
  }

}
