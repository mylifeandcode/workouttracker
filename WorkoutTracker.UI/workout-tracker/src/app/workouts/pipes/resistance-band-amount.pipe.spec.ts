import { TestBed } from '@angular/core/testing';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandService } from 'app/shared/resistance-band.service';
import { Observable, of } from 'rxjs';
import { ResistanceBandAmountPipe } from './resistance-band-amount.pipe';

class MockResistanceBandService {
  private _bands: ResistanceBand[] = [];
  constructor() {
    this._bands.push(<ResistanceBand>{ color: 'Onyx', maxResistanceAmount: 40, numberAvailable: 4 });
    this._bands.push(<ResistanceBand>{ color: 'Orange', maxResistanceAmount: 30, numberAvailable: 4 });
    this._bands.push(<ResistanceBand>{ color: 'Purple', maxResistanceAmount: 23, numberAvailable: 2 });
    this._bands.push(<ResistanceBand>{ color: 'Black', maxResistanceAmount: 19, numberAvailable: 1 });
    this._bands.push(<ResistanceBand>{ color: 'Blue', maxResistanceAmount: 13, numberAvailable: 1 });
    this._bands.push(<ResistanceBand>{ color: 'Red', maxResistanceAmount: 8, numberAvailable: 1 });
    this._bands.push(<ResistanceBand>{ color: 'Green', maxResistanceAmount: 5, numberAvailable: 1 });
    this._bands.push(<ResistanceBand>{ color: 'Yellow', maxResistanceAmount: 3, numberAvailable: 1 });
    this.all$ = of(this._bands);
  }

  public all$: Observable<ResistanceBand[]>; 

}

fdescribe('ResistanceBandAmountPipe', () => {

  let pipe: ResistanceBandAmountPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ResistanceBandAmountPipe,
        {
          provide: ResistanceBandService,
          useClass: MockResistanceBandService
        }
      ]
    });

    pipe = TestBed.inject(ResistanceBandAmountPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform resistance bands string to max resistance amount', () => {
    expect(pipe.transform('Onyx, Onyx, Onyx, Purple')).toBe("143 Max");
  });
});
