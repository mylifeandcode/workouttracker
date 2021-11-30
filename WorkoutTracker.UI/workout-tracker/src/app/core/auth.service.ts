import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { ConfigService } from './config.service';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

const HTTP_OPTIONS_FOR_TEXT_RESPONSE = {
  headers: new HttpHeaders({
    'Accept': 'text/html, application/xhtml+xml, */*',
    'Content-Type':  'application/json'
  }), 
  responseType: 'text' as 'json'
};


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private _apiRoot: string;

  public token: string;
  
  constructor(private _http: HttpClient, private _configService: ConfigService) { 

  }

  public init(): void {
    //Race condition in app initializer prevents this from being done in constructor
    this._apiRoot = this._configService.get("apiRoot") + "auth";
  }

  public logIn(username: string, password: string): Observable<boolean> {
    return this._http.post<string>(`${this._apiRoot}/login`, { username, password }, HTTP_OPTIONS_FOR_TEXT_RESPONSE) //TODO: Create strong type for credentials object
      .pipe(
        map((token: string) => {
          window.alert("TOKEN: " + token);
          this.token = token;
          return true;
        })
      );
  }

}

