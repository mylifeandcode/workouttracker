import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Exercise } from '../../workouts/_models/exercise';
import { TargetArea } from '../../workouts/_models/target-area';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { ExerciseDTO } from '../../workouts/_models/exercise-dto';
import { ConfigService } from '../../core/_services/config/config.service';
import { DateSerializationService } from '../../core/_services/date-serialization/date-serialization.service';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);
  private _dateService = inject(DateSerializationService);


  private readonly API_ROOT: string;
  private _resistanceTypes: Observable<Map<number, string>> | undefined;
  private readonly TARGET_AREAS_API_ROOT: string; //TODO: Create TargetAreaService

  constructor() {
    const apiRoot: string = (this._configService.get("apiRoot") as string);
    this.API_ROOT = apiRoot + "exercises";
    this.TARGET_AREAS_API_ROOT = apiRoot + "TargetAreas";
  }

  public getAll(
    firstRecOffset: number,
    pageSize: number,
    nameContains: string | null = null,
    targetAreaContains: string[] | null = null): Observable<PaginatedResults<ExerciseDTO>> {

    let url: string = `${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}`;

    if (nameContains)
      url += `&nameContains=${nameContains}`;

    if (targetAreaContains) {
      const targetAreas = targetAreaContains.join(',');
      url += `&hasTargetAreas=${targetAreas}`;
    }

    return this._http
      .get<PaginatedResults<ExerciseDTO>>(url)
      .pipe(
        map((paginatedResults) => {
          paginatedResults.results.forEach(exercise => {
            this._dateService.convertAuditDateStringsToDates(exercise);
          });
          return paginatedResults;
        })
      );
  }

  /*
  public getById(id: number): Observable<Exercise> {
    return this._http.get<Exercise>(`${this.API_ROOT}/${id}`);
  }
  */

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

  public getTargetAreas(): Observable<Array<TargetArea>> {
    //TODO: Move this into its own service
    return this._http
      .get<Array<TargetArea>>(this.TARGET_AREAS_API_ROOT)
      .pipe(
        map((targetAreas) => {
          targetAreas.forEach(targetArea => {
            this._dateService.convertAuditDateStringsToDates(targetArea);
          });
          return targetAreas;
        })
      );
  }

  public add(exercise: Exercise): Observable<Exercise> {
    return this._http
      .post<Exercise>(this.API_ROOT, exercise, HTTP_OPTIONS)
      .pipe(
        map((newExercise) => {
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
      this._resistanceTypes = this._http.get<Map<number, string>>(`${this.API_ROOT}/ResistanceTypes`);

    return this._resistanceTypes;
  }

}
