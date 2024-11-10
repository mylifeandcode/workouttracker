import { Component, OnInit } from '@angular/core';

import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';

import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandService } from '../../shared/resistance-band.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'wt-resistance-bands',
    templateUrl: './resistance-bands.component.html',
    styleUrls: ['./resistance-bands.component.scss'],
    standalone: true,
    imports: [ToastModule, ConfirmDialogModule, TableModule, PrimeTemplate, FormsModule, NgStyle, ButtonDirective, DialogModule]
})
export class ResistanceBandsComponent implements OnInit {

  public resistanceBands: ResistanceBand[] = [];
  public busy: boolean = false; //TODO: Implement
  public busyMsg: string | undefined; //TODO: Implement

  //Add modal related
  public showAddDialog: boolean = false;
  //public newResistanceBand: ResistanceBand | null = null; //TODO: Revisit. Not really a fan of this approach.
  public newResistanceBand: ResistanceBand = new ResistanceBand();
  public modalSubmitted: boolean = false;

  //This is used to store the original row when we go into edit mode
  private _clonedResistanceBands: { [id: number]: ResistanceBand; } = {}; //TODO: Revisit. This isn't an array of ResistanceBands, but rather an object with an indexer and ResistanceBand-type property.

  constructor(
    private _resistanceBandService: ResistanceBandService,
    private _messageService: MessageService,
    private _confirmationService: ConfirmationService) { }

  //Table edit code based on PrimeNg's example at https://www.primefaces.org/primeng/showcase/#/table/edit

  public ngOnInit(): void {
    this.getResistanceBandData(true);
  }

  public onRowEditInit(band: ResistanceBand): void {
    //Clone the row we're editing in case we decide to cancel. That way, we can get the original version back.
    this._clonedResistanceBands[band.id] = { ...band };
  }

  public onRowEditSave(band: ResistanceBand): void {
    //Delete our cloned row, we don't need it any more.
    delete this._clonedResistanceBands[band.id];
    this.updateResistanceBand(band);
  }

  public onRowEditCancel(band: ResistanceBand, index: number): void {
    //if (!this.resistanceBands) return;

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
    if (resistanceBand.publicId == null) return;

    const bandId = resistanceBand.publicId;
    this._confirmationService.confirm({
      message: 'Are you sure you want to delete this resistance band?',
      accept: () => {
        this._resistanceBandService
          .deleteById(bandId)
          .subscribe((response: any) => {
            this._messageService.add({ severity: 'success', summary: 'Successful', detail: 'Resistance Band deleted', life: 3000 });
            this.getResistanceBandData(false);
          });
      }
    });
  }

  public hideModal(): void {
    this.showAddDialog = false;
    this.modalSubmitted = false;
  }

  private getResistanceBandData(fromCache: boolean): void {
    this._resistanceBandService
      .getAll(fromCache)
      .subscribe((results: ResistanceBand[]) => {
        this.resistanceBands = results;
      });
  }

  private addResistanceBand(): void {
    //if(!this.newResistanceBand) return;

    this._resistanceBandService
      .add(this.newResistanceBand)
      .subscribe({
        next: (band: ResistanceBand) => {
          this._messageService.add({ severity: 'success', summary: 'Successful', detail: 'Resistance Band added', life: 3000 });
          this.getResistanceBandData(false);
        },
        error: (error: any) => {
          this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add Resistance Band', sticky: true });
        }
      });
  }

  private updateResistanceBand(band: ResistanceBand): void {
    this._resistanceBandService
      .update(band)
      .subscribe({
        next: (updatedBand: ResistanceBand) => {
          this._messageService.add({ severity: 'success', summary: 'Successful', detail: 'Resistance Band updated', life: 3000 });
        },
        error: (error: any) => {
          this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update Resistance Band', sticky: true });
        }
      });
  }
}
