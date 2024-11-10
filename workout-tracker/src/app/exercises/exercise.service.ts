import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../workouts/models/exercise';
import { TargetArea } from '../workouts/models/target-area';
import { PaginatedResults } from '../core/models/paginated-results';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { ConfigService } from 'app/core/services/config/config.service';

const HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

@Injectable({
    providedIn: 'root'
})
export class ExerciseService {

    private readonly API_ROOT: string;
    private _resistanceTypes: Observable<Map<number, string>> | undefined;
    private readonly TARGET_AREAS_API_ROOT: string; //TODO: Create TargetAreaService

    constructor(private _http: HttpClient, private _configService: ConfigService) { 
      const apiRoot: string = this._configService.get("apiRoot");
      this.API_ROOT = apiRoot + "exercises";
      this.TARGET_AREAS_API_ROOT = apiRoot + "TargetAreas";
    }

    public getAll(firstRecOffset: number, pageSize: number, nameContains: string | null = null, targetAreaContains: string[] | null = null): Observable<PaginatedResults<ExerciseDTO>> {
        
      let url: string = `${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}`;

      if(nameContains)
        url += `&nameContains=${nameContains}`;

      if(targetAreaContains) {
        const targetAreas = targetAreaContains.join(',');
        url += `&hasTargetAreas=${targetAreas}`;
      }

      return this._http.get<PaginatedResults<ExerciseDTO>>(url);

    }

    /*
    public getById(id: number): Observable<Exercise> {
      return this._http.get<Exercise>(`${this.API_ROOT}/${id}`);
    }
    */

    public getById(publicId: string): Observable<Exercise> {
      return this._http.get<Exercise>(`${this.API_ROOT}/${publicId}`);
    }    

    public getTargetAreas(): Observable<Array<TargetArea>> {
      //TODO: Move this into its own service
      return this._http.get<Array<TargetArea>>(this.TARGET_AREAS_API_ROOT);
    }

    public add(exercise: Exercise): Observable<Exercise> {
      return this._http.post<Exercise>(this.API_ROOT, exercise, HTTP_OPTIONS);
    }

    public update(exercise: Exercise): Observable<Exercise> {
      return this._http.put<Exercise>(this.API_ROOT, exercise, HTTP_OPTIONS);
    }

    public getResistanceTypes(): Observable<Map<number, string>> {
      if (!this._resistanceTypes)
        this._resistanceTypes = this._http.get<Map<number, string>>(`${this.API_ROOT}/ResistanceTypes`);

      return this._resistanceTypes;
    }

}
