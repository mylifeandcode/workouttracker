import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsertSpaceBeforeCapitalPipe } from './pipes/insert-space-before-capital.pipe';
import { ResistanceBandColorPipe } from './pipes/resistance-band-color.pipe';
import { ZeroIsBadPipe } from './pipes/zero-is-bad.pipe';



@NgModule({
  declarations: [
    InsertSpaceBeforeCapitalPipe,
    ResistanceBandColorPipe,
    ZeroIsBadPipe
  ],
  imports: [
    CommonModule
  ], 
  exports: [
    InsertSpaceBeforeCapitalPipe,
    ResistanceBandColorPipe,
    ZeroIsBadPipe
  ]
})
export class SharedModule { }
