import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiBaseService } from 'app/core/_services/api-base/api-base.service';
import { ConfigService } from 'app/core/_services/config/config.service';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

//TODO: Move to Core or Shared module
//TODO: Implement caching and cache-busting

@Injectable({
  providedIn: 'root'
})
export class ResistanceBandService extends ApiBaseService<ResistanceBand> {

  constructor() {
    const _configService = inject(ConfigService);
    const _http = inject(HttpClient);

    super(_configService.get('apiRoot') + "resistancebands", _http);
  }

  /**
   * Gets an array of all individual resistance bands, rather than an array of the domain
   * objects which include the numberAvailable property.
   */
  public getAllIndividualBands(): Observable<ResistanceBandIndividual[]> {
    return this.getAll()
      .pipe(
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
