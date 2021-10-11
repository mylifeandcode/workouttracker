import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../workouts/models/exercise';
import { TargetArea } from '../workouts/models/target-area';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResults } from '../core/models/paginated-results';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { ConfigService } from 'app/core/config.service';

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
    private _targetAreas: Observable<Array<TargetArea>>;
    private _resistanceTypes: Observable<Map<number, string>>;
    private readonly TARGET_AREAS_API_ROOT: string; //TODO: Create TargetAreaService

    constructor(private _http: HttpClient, private _configService: ConfigService) { 
        const apiRoot: string = this._configService.get("apiRoot");
        this.API_ROOT = apiRoot + "exercises";
        this.TARGET_AREAS_API_ROOT = apiRoot + "TargetAreas";
    }

    public getAll(firstRecOffset: number, pageSize: number, nameContains: string = null, targetAreaContains: string = null): Observable<PaginatedResults<ExerciseDTO>> {
        
        let url: string = `${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}`;

        if(nameContains)
            url += `&nameContains=${nameContains}`;

        if(targetAreaContains)
            url += `&hasTargetAreas=${targetAreaContains}`;

        return this._http
            .get(url)
            .pipe(map((resp: PaginatedResults<ExerciseDTO>) => resp));
    }

    public getById(id: number): Observable<Exercise> {
        return this._http.get(`${this.API_ROOT}/${id}`)
            .pipe(map((resp: Exercise) => resp));
    }

    public getTargetAreas(): Observable<Array<TargetArea>> {
        //TODO: Move this into its own service
        return this._http.get<Array<TargetArea>>(this.TARGET_AREAS_API_ROOT);
    }

    public add(exercise: Exercise): Observable<Exercise> {
        return this._http.post<Exercise>(this.API_ROOT, exercise, HTTP_OPTIONS);
    }

    public update(exercise: Exercise): Observable<Exercise> {
        return this._http.put<Exercise>(`${this.API_ROOT}/${exercise.id}`, exercise, HTTP_OPTIONS);
    }

    public getResistanceTypes(): Observable<Map<number, string>> {
        if (!this._resistanceTypes)
            this._resistanceTypes = this._http.get<Map<number, string>>(`${this.API_ROOT}/ResistanceTypes`);

        return this._resistanceTypes;
    }

}