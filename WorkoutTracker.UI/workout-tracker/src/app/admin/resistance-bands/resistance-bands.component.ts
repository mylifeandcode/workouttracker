import { Component, OnInit } from '@angular/core';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandService } from './resistance-band.service';

@Component({
  selector: 'app-resistance-bands',
  templateUrl: './resistance-bands.component.html',
  styleUrls: ['./resistance-bands.component.css']
})
export class ResistanceBandsComponent implements OnInit {

  constructor(private _service: ResistanceBandService) { }

  public resistanceBands: ResistanceBand[] = [];
  public busy: boolean = false;
  public busyMsg: string;

  ngOnInit(): void {
    this.getResistanceBandData();
  }

  private getResistanceBandData(): void {
    this._service
      .getAll()
      .subscribe((results: ResistanceBand[]) => this.resistanceBands = results);
  }

}
