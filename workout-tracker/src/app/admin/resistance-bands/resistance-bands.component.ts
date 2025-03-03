import { Component, OnInit, inject } from '@angular/core';

import { SharedModule } from 'primeng/api';

import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandService } from '../../shared/services/resistance-band.service';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { finalize } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'wt-resistance-bands',
  templateUrl: './resistance-bands.component.html',
  styleUrls: ['./resistance-bands.component.scss'],
  imports: [
    NzTableModule, SharedModule, FormsModule, NgStyle, ButtonDirective, 
    NzIconModule, NzModalModule, NzButtonModule]
})
export class ResistanceBandsComponent implements OnInit {
  private readonly _resistanceBandService = inject(ResistanceBandService);
  private readonly _messageService = inject(NzMessageService);
  private readonly _modalService = inject(NzModalService);

  public resistanceBands: ResistanceBand[] = [];
  public busy: boolean = false;
  public busyMsg: string | undefined;

  //Add modal related
  public showAddDialog: boolean = false;
  public newResistanceBand: ResistanceBand = new ResistanceBand();
  public modalSubmitted: boolean = false;

  //This is used to store the original row when we go into edit mode
  //private _clonedResistanceBands: { [id: number]: ResistanceBand; } = {};
  public editCache: { [key: number]: { edit: boolean; data: ResistanceBand } } = {};

  //Table edit code based on PrimeNg's example at https://www.primefaces.org/primeng/showcase/#/table/edit

  public ngOnInit(): void {
    this.getResistanceBandData(true);
  }

  /*
  public onRowEditInit(band: ResistanceBand): void {
    //Clone the row we're editing in case we decide to cancel. That way, we can get the original version back.
    this._clonedResistanceBands[band.id] = { ...band };
  }
  */

  public startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  public cancelEdit(id: number): void {
    const index = this.resistanceBands.findIndex(item => item.id === id);
    this.editCache[id] = {
      data: { ...this.resistanceBands[index] },
      edit: false
    };
  }

  public saveEdit(id: number): void {
    const index = this.resistanceBands.findIndex(item => item.id === id);
    Object.assign(this.resistanceBands[index], this.editCache[id].data);
    this.editCache[id].edit = false;
  }

  /*
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
  */

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

    this._modalService.confirm({
      nzTitle: 'Are You Sure?',
      nzContent: 'Are you sure you want to delete this resistance band?',
      nzOnOk: () =>
        this._resistanceBandService
          .deleteById(bandId)
          .subscribe((response: any) => {
            this._messageService.create('success', 'Resistance band deleted.');
            this.getResistanceBandData(false);
          })
    });

  }

  public hideModal(): void {
    this.showAddDialog = false;
    this.modalSubmitted = false;
  }

  private setupEditCache(): void {
    this.resistanceBands.forEach(item => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item }
      };
    });
  }

  private getResistanceBandData(fromCache: boolean): void {
    this.busy = true;
    this.busyMsg = 'Getting resistance band data...';
    this._resistanceBandService
      .getAll(fromCache)
      .pipe(
        finalize(() => {
          this.busy = false;
          this.busyMsg = undefined;
        })
      )
      .subscribe((results: ResistanceBand[]) => {
        this.resistanceBands = results;
        this.setupEditCache();
      });
  }

  private addResistanceBand(): void {
    this.busy = true;
    this.busyMsg = 'Adding...';

    this._resistanceBandService
      .add(this.newResistanceBand)
      .pipe(
        finalize(() => {
          this.busy = false;
          this.busyMsg = undefined;
        })
      )
      .subscribe({
        next: (band: ResistanceBand) => {
          this._messageService.create('success', 'Resistance band added.');
          this.getResistanceBandData(false);
        },
        error: (error: any) => {
          this._messageService.create('error', 'Failed to add resistance band.');
        }
      });
  }

  private updateResistanceBand(band: ResistanceBand): void {
    this.busy = true;
    this.busyMsg = 'Updating...';

    this._resistanceBandService
      .update(band)
      .pipe(
        finalize(() => {
          this.busy = false;
          this.busyMsg = undefined;
        })
      )
      .subscribe({
        next: (updatedBand: ResistanceBand) => {
          this._messageService.create('success', 'Resistance band updated.');
        },
        error: (error: any) => {
          this._messageService.create('error', 'Failed to update resistance band.');
        }
      });
  }
}
