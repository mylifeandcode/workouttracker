import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'app/core/api-base.service';
import { ConfigService } from 'app/core/config.service';
import { ResistanceBand } from 'app/shared/models/resistance-band';

@Injectable({
  providedIn: 'root'
})
export class ResistanceBandService extends ApiBaseService<ResistanceBand> {

  constructor(private _configService: ConfigService, _http: HttpClient) { 
    super( _configService.get('apiRoot') + "resistancebands", _http);
  }

}
