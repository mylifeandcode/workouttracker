import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandService } from 'app/shared/resistance-band.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'resistanceBandAmount'
})
export class ResistanceBandAmountPipe implements PipeTransform, OnDestroy {

  private _resistanceBandsSubscription: Subscription;
  private _resistanceBands: ResistanceBand[];

  constructor(private _resistanceBandsService: ResistanceBandService) {
    this._resistanceBandsSubscription = 
      this._resistanceBandsService.all$
        .subscribe((resistanceBands: ResistanceBand[]) => {
          this._resistanceBands = resistanceBands;
        });
  }
  
  ngOnDestroy(): void {
    this._resistanceBandsSubscription.unsubscribe();
  }

  transform(value: string): string {
    let total: number = 0;
    const bands: string[] = value.split(',');
    bands.forEach((band: string) => {
      const foundBand = this._resistanceBands.find((resistanceBand: ResistanceBand) => resistanceBand.color == band.trim());
      if (foundBand) {
        total += foundBand.maxResistanceAmount;
      }
    });
    return total.toString() + " Max";
  }

}
