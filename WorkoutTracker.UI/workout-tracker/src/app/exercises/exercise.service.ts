import { Injectable } from '@angular/core';
import { Response, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../models/exercise';
import { TargetArea } from '../models/target-area';
import { map, catchError } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

@Injectable()
export class ExerciseService {

    private readonly API_ROOT: string = "http://localhost:5600/api/exercises";

    constructor(private _http: HttpClient) { }

    public getAll(): Observable<Array<Exercise>> {
        //TODO: Refactor to get pages of filtered data
        return this._http.get(`${this.API_ROOT}?startPage=1&pageSize=50`)
            .pipe(map((resp: Array<Exercise>) => resp)); //TODO: Fully implement
    }

    public getById(id: number): Observable<Exercise> {
        return null; //TODO: Implement
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
        return null; //TODO: Implement
    }

}
