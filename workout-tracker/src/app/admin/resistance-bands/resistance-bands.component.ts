import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';

import { ResistanceBand } from '../../shared/models/resistance-band';
import { ResistanceBandService } from '../../shared/services/resistance-band.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { NgStyle } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'wt-resistance-bands',
  templateUrl: './resistance-bands.component.html',
  styleUrls: ['./resistance-bands.component.scss'],
  imports: [
    FormsModule, NzTableModule, NgStyle,
    NzIconModule, NzModalModule, NzButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResistanceBandsComponent implements OnInit {
  private readonly _resistanceBandService = inject(ResistanceBandService);
  private readonly _messageService = inject(NzMessageService);
  private readonly _modalService = inject(NzModalService);

  public resistanceBands: ResistanceBand[] = [];
  public busy = signal<boolean>(false);
  public busyMsg = signal<string | undefined>(undefined);

  //Add modal related
  public showAddDialog = signal<boolean>(false);
  public newResistanceBand: ResistanceBand = new ResistanceBand();
  public modalSubmitted = signal<boolean>(false);

  //This is used to store the original row when we go into edit mode
  public editCache: { [key: number]: { edit: boolean; data: ResistanceBand } } = {};

  public ngOnInit(): void {
    this.getResistanceBandData(true);
  }

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
    this.updateResistanceBand(this.editCache[id].data);
  }

  public openAddModal(): void {
    this.newResistanceBand = new ResistanceBand();
    this.modalSubmitted.set(false);
    this.showAddDialog.set(true);
  }

  public saveNewBand(): void {
    this.showAddDialog.set(false);
    this.addResistanceBand();
  }

  public deleteBand(resistanceBand: ResistanceBand): void {
    if (resistanceBand.publicId == null) return;

    const bandId = resistanceBand.id;

    this._modalService.confirm({
      nzTitle: 'Are You Sure?',
      nzContent: 'Are you sure you want to delete this resistance band?',
      nzOnOk: () =>
        this._resistanceBandService
          .delete(bandId)
          .subscribe((response: any) => {
            this._messageService.create('success', 'Resistance band deleted.');
            this.getResistanceBandData(false);
          })
    });

  }

  public hideModal(): void {
    this.showAddDialog.set(false);
    this.modalSubmitted.set(false);
  }

  public sortColumnByColor(a: ResistanceBand, b: ResistanceBand): number {
    return a.color.localeCompare(b.color);
  }

  public sortColumnByMaxResistance(a: ResistanceBand, b: ResistanceBand): number {
    return a.maxResistanceAmount - b.maxResistanceAmount;
  }

  public sortColumnByNumberAvailable(a: ResistanceBand, b: ResistanceBand): number {
    return a.numberAvailable - b.numberAvailable;
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
    this.busy.set(true);
    this.busyMsg.set('Getting resistance band data...');
    this._resistanceBandService
      .getAll(fromCache)
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.busyMsg.set(undefined);
        })
      )
      .subscribe((results: ResistanceBand[]) => {
        this.resistanceBands = results;
        this.setupEditCache();
      });
  }

  private addResistanceBand(): void {
    this.busy.set(true);
    this.busyMsg.set('Adding...');

    this._resistanceBandService
      .add(this.newResistanceBand)
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.busyMsg.set(undefined);
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
    this.busy.set(true);
    this.busyMsg.set('Updating...');

    this._resistanceBandService
      .update(band)
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.busyMsg.set(undefined);
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
