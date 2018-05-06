import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Exercise } from '../models/exercise';
import { TargetArea } from '../models/target-area';
import 'rxjs/add/operator/map';

@Injectable()
export class ExerciseService {

    private readonly API_ROOT: string = "http://localhost:5600/api/exercises";

    constructor(private _http: Http) { }

    public getAll(): Observable<Array<Exercise>> {
        //TODO: Refactor to get pages of filtered data
        return this._http.get(`${this.API_ROOT}?startPage=1&pageSize=50`).map((resp: Response) => <Array<Exercise>>resp.json()); //TODO: Fully implement
    }

    public getById(id: number): Observable<Exercise> {
        return null; //TODO: Implement
    }

    public getTargetAreas(): Observable<Array<TargetArea>> {
        //TODO: Move this into its own service?
        return this._http.get("http://localhost:5600/api/TargetAreas").map((resp: Response) => <Array<TargetArea>>resp.json());
    }

    public add(exercise: Exercise): Observable<Exercise> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this._http.post(this.API_ROOT, exercise, options)
            .map((response: Response) => response.json()); 
    }

    public update(exercise: Exercise): Observable<Exercise> {
        return null; //TODO: Implement
    }

}
