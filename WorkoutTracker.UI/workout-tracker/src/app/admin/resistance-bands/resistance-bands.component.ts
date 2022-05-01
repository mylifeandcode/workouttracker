import { Component, OnDestroy, OnInit } from '@angular/core';

import { ConfirmationService, MessageService } from 'primeng/api';

import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandService } from './resistance-band.service';

@Component({
  selector: 'wt-resistance-bands',
  templateUrl: './resistance-bands.component.html',
  styleUrls: ['./resistance-bands.component.css']
})
export class ResistanceBandsComponent implements OnInit {

  public resistanceBands: ResistanceBand[] | null = null;
  public busy: boolean = false;
  public busyMsg: string;

  //Add modal related
  public showAddDialog: boolean;
  public newResistanceBand: ResistanceBand | null = null; //TODO: Revisit. Not really a fan of this approach.
  public modalSubmitted: boolean;

  //This is used to store the original row when we go into edit mode
  private _clonedResistanceBands: { [id: number]: ResistanceBand; } = {};

  constructor(
    private _resistanceBandService: ResistanceBandService,
    private _messageService: MessageService,
    private _confirmationService: ConfirmationService) { }

  //Table edit code based on PrimeNg's example at https://www.primefaces.org/primeng/showcase/#/table/edit

  public ngOnInit(): void {
    this.getResistanceBandData();
  }

  public onRowEditInit(band: ResistanceBand): void {
    //Clone the row we're editing in case we decide to cancel. That way, we can get the original version back.
    this._clonedResistanceBands[band.id] = {...band};
  }

  public onRowEditSave(band: ResistanceBand): void {
    //Delete our cloned row, we don't need it any more.
    delete this._clonedResistanceBands[band.id];

    //this.messageService.add({severity:'success', summary: 'Success', detail:'Product is updated'});
    this.updateResistanceBand(band);
  }

  public onRowEditCancel(band: ResistanceBand, index: number): void {
    if (!this.resistanceBands) return;

    //Replace the row we were editing with the clone, so in case we made any changes we'll get the original
    //version back.
    this.resistanceBands[index] = this._clonedResistanceBands[band.id];

    //Delete the clone row, we don't need it anymore.
    delete this._clonedResistanceBands[band.id];
  }

  public openAddModal(): void {
    this.newResistanceBand = new ResistanceBand();
    this.modalSubmitted = false;
    this.showAddDialog = true;
  }

  public saveNewBand(): void {
    this.showAddDialog = false;
    this.addResistanceBand();
  }

  public deleteBand(resistanceBand: ResistanceBand): void {
      this._confirmationService.confirm({
        message: 'Are you sure you want to delete this resistance band?',
        accept: () => {
          this._resistanceBandService
          .delete(resistanceBand.id)
          .subscribe((response: any) => {
            this._messageService.add({severity:'success', summary: 'Successful', detail: 'Resistance Band deleted', life: 3000});
            this.getResistanceBandData();
          });
        }
    });
  }

  public hideModal(): void {
    this.showAddDialog = false;
    this.modalSubmitted = false;
  }

  private getResistanceBandData(): void {
    this._resistanceBandService
      .getAll()
      .subscribe((results: ResistanceBand[]) => this.resistanceBands = results);
  }

  private addResistanceBand(): void {
    //this.newResistanceBand.createdByUserId = this._userService.currentUserId; //TODO: Refactor. Set in API based on User ID from token.
    //this.newResistanceBand.createdDateTime = new Date();
    if(!this.newResistanceBand) return;

    this._resistanceBandService
      .add(this.newResistanceBand)
      .subscribe(
        (band: ResistanceBand) => {
          this._messageService.add({severity:'success', summary: 'Successful', detail: 'Resistance Band added', life: 3000});
          this.getResistanceBandData();
        },
        (error: any) => {
          this._messageService.add({severity:'error', summary: 'Error', detail: 'Failed to add Resistance Band', sticky: true});
        }
      );
  }

  private updateResistanceBand(band: ResistanceBand): void {
    //band.modifiedByUserId = this._userService.currentUserId; //TODO: Refactor. Set in API based on User ID from token.
    //band.modifiedDateTime = new Date();
    this._resistanceBandService
      .update(band)
      .subscribe(
        (updatedBand: ResistanceBand) => {
          this._messageService.add({severity:'success', summary: 'Successful', detail: 'Resistance Band updated', life: 3000});
        },
        (error: any) => {
          this._messageService.add({severity:'error', summary: 'Error', detail: 'Failed to update Resistance Band', sticky: true});
        }
      );
  }
}
