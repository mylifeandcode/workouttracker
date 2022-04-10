import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsertSpaceBeforeCapitalPipe } from './pipes/insert-space-before-capital.pipe';
import { ResistanceBandColorPipe } from './pipes/resistance-band-color.pipe';



@NgModule({
  declarations: [
    InsertSpaceBeforeCapitalPipe,
    ResistanceBandColorPipe
  ],
  imports: [
    CommonModule
  ], 
  exports: [
    InsertSpaceBeforeCapitalPipe,
    ResistanceBandColorPipe
  ]
})
export class SharedModule { }
