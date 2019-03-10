import { Injectable } from '@angular/core';
import { Response, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../models/exercise';
import { TargetArea } from '../models/target-area';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResults } from '../models/paginated-results';

const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

@Injectable()
export class ExerciseService {

    private readonly API_ROOT: string = "http://localhost:5600/api/exercises"; //TODO: Get from environment config

    constructor(private _http: HttpClient) { }

    public getAll(firstRecOffset: number, pageSize: number): Observable<PaginatedResults<Exercise>> {
        //TODO: Refactor to get pages of filtered data
        return this._http.get(`${this.API_ROOT}?firstRecord=${firstRecOffset}&pageSize=${pageSize}`)
            .pipe(map((resp: PaginatedResults<Exercise>) => resp)); //TODO: Fully implement
    }

    public getById(id: number): Observable<Exercise> {
        return this._http.get(`${this.API_ROOT}/${id}`)
            .pipe(map((resp: Exercise) => resp));
    }

    public getTargetAreas(): Observable<Array<TargetArea>> {
        //TODO: Move this into its own service?
        return this._http.get("http://localhost:5600/api/TargetAreas")
            //.pipe(map((resp: Response) => <Array<TargetArea>>resp));
            .pipe(map((resp: Array<TargetArea>) => resp));
    }

    public add(exercise: Exercise): Observable<Exercise> {
        return this._http.post<Exercise>(this.API_ROOT, exercise, httpOptions);
    }

    public update(exercise: Exercise): Observable<Exercise> {
        return this._http.put<Exercise>(`${this.API_ROOT}/${exercise.id}`, exercise, httpOptions);
    }

}
