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

  private _clonedResistanceBands: { [id: number]: ResistanceBand; } = {};

  //Table edit code based on PrimeNg's example at https://www.primefaces.org/primeng/showcase/#/table/edit

  ngOnInit(): void {
    this.getResistanceBandData();
  }

  private getResistanceBandData(): void {
    this._service
      .getAll()
      .subscribe((results: ResistanceBand[]) => this.resistanceBands = results);
  }

  onRowEditInit(band: ResistanceBand) {
    this._clonedResistanceBands[band.id] = {...band};
  }

  onRowEditSave(band: ResistanceBand) {
    delete this._clonedResistanceBands[band.id];
    //this.messageService.add({severity:'success', summary: 'Success', detail:'Product is updated'});
    //TODO: Make service call to update
  }

  onRowEditCancel(band: ResistanceBand, index: number) {
      this.resistanceBands[index] = this._clonedResistanceBands[band.id];
      delete this.resistanceBands[band.id];
  }  
}
