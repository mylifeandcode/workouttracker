import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'app/core/api-base.service';
import { ConfigService } from 'app/core/config.service';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

//TODO: Move to Core or Shared module
//TODO: Implement caching and cache-busting

@Injectable({
  providedIn: 'root'
})
export class ResistanceBandService extends ApiBaseService<ResistanceBand> {

  constructor(private _configService: ConfigService, _http: HttpClient) {
    super(_configService.get('apiRoot') + "resistancebands", _http);
  }

  /*
  private _refreshAllIndividualBands = new BehaviorSubject<void>(undefined);

  public allIndividualBands$: Observable<ResistanceBandIndividual[]> =
    this.getAll
    .pipe(
      map((bands: ResistanceBand[]) => {
        const individualBands: ResistanceBandIndividual[] = [];
        bands.map((band: ResistanceBand) => {
          for(let x = 0; x < band.numberAvailable; x++) {
            individualBands.push(new ResistanceBandIndividual(band.color, band.maxResistanceAmount));
          }
        })
        return individualBands;
      }),
      shareReplay(1)
    );
  */

  /**
   * Gets an array of all individual resistance bands, rather than an array of the domain
   * objects which include the numberAvailable property.
   */
  public getAllIndividualBands(): Observable<ResistanceBandIndividual[]> {
    return this.all
      .pipe(
        map((bands: ResistanceBand[]) => {
          const individualBands: ResistanceBandIndividual[] = [];
          bands.map((band: ResistanceBand) => {
            for(let x = 0; x < band.numberAvailable; x++) {
              individualBands.push(new ResistanceBandIndividual(band.color, band.maxResistanceAmount));
            }
          })
          return individualBands;
        })
      );
  }

}
