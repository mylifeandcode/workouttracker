import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Exercise } from './exercise';
import { TargetArea } from './target-area';
import 'rxjs/add/operator/map';

@Injectable()
export class ExerciseService {

  constructor(private _http: Http) { }

  public getAll(): Observable<Array<Exercise>> {
    return null; //TODO: Implement
  }

  public getById(id: number): Observable<Exercise> {
    return null; //TODO: Implement
  }

  public getTargetAreas(): Observable<Array<TargetArea>> {
    return this._http.get('api/exercises/targetAreas').map((resp: Response) => <Array<TargetArea>>resp.json());
  }

}
