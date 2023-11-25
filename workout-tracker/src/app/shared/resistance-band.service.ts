import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'app/core/services/api-base/api-base.service';
import { ConfigService } from 'app/core/services/config/config.service';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

//TODO: Move to Core or Shared module
//TODO: Implement caching and cache-busting

@Injectable({
  providedIn: 'root'
})
export class ResistanceBandService extends ApiBaseService<ResistanceBand> {

  constructor(_configService: ConfigService, _http: HttpClient) {
    super(_configService.get('apiRoot') + "resistancebands", _http);
  }

  /**
   * Gets an array of all individual resistance bands, rather than an array of the domain
   * objects which include the numberAvailable property.
   */
  public getAllIndividualBands(): Observable<ResistanceBandIndividual[]> {
    return this.getAll()
      .pipe(
        //tap(() =>console.log("GOT THE BANDS")),
        map((bands: ResistanceBand[]) => {
          const individualBands: ResistanceBandIndividual[] = [];
          bands.map((band: ResistanceBand) => {
            for(let x = 0; x < band.numberAvailable; x++) {
              individualBands.push(new ResistanceBandIndividual(band.color, band.maxResistanceAmount));
            }
          });
          return individualBands;
        })
      );
  }

}
