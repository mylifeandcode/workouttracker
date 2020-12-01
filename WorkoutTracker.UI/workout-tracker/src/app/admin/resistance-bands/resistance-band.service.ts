import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'app/core/config.service';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { Observable } from 'rxjs';

//TODO: Add to a base class and extend
const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};  

@Injectable({
  providedIn: 'root'
})
export class ResistanceBandService {

  private _apiRoot: string;

  constructor(private _configService: ConfigService, private _http: HttpClient) { 
    this._apiRoot = _configService.get('apiRoot') + "resistancebands";
    console.log("ResistanceBandService apiRoot is " + this._apiRoot);
  }

  public getAll(): Observable<ResistanceBand[]> {
    return this._http.get<ResistanceBand[]>(this._apiRoot);
  }

  public getById(id: number): Observable<ResistanceBand> {
    return this._http.get<ResistanceBand>(`${this._apiRoot}/${id}`);
  }
}
