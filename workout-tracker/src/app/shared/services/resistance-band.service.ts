import { Injectable } from '@angular/core';
import { ApiBaseService } from '../../core/_services/api-base/api-base.service';
import { ResistanceBandDTO } from '../../api';
import { ResistanceBandIndividual } from '../models/resistance-band-individual';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

//TODO: Implement caching and cache-busting

@Injectable({
  providedIn: 'root'
})
export class ResistanceBandService extends ApiBaseService<ResistanceBandDTO> {

  constructor() {
    super("resistancebands");
  }

  /**
   * Gets an array of all individual resistance bands, rather than an array of the domain
   * objects which include the numberAvailable property.
   */
  public getAllIndividualBands(): Observable<ResistanceBandIndividual[]> {
    return this.getAll()
      .pipe(
        map((bands: ResistanceBandDTO[]) => {
          const individualBands: ResistanceBandIndividual[] = [];
          bands.map((band: ResistanceBandDTO) => {
            for(let x = 0; x < band.numberAvailable; x++) {
              individualBands.push(new ResistanceBandIndividual(band.color, band.maxResistanceAmount));
            }
          });
          return individualBands;
        })
      );
  }

}
