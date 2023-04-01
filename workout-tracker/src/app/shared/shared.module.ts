import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsertSpaceBeforeCapitalPipe } from './pipes/insert-space-before-capital.pipe';
import { ResistanceBandColorPipe } from './pipes/resistance-band-color.pipe';
import { ZeroIsBadPipe } from './pipes/zero-is-bad.pipe';
import { SelectOnFocusDirective } from './select-on-focus.directive';


@NgModule({
  declarations: [
    InsertSpaceBeforeCapitalPipe,
    ResistanceBandColorPipe,
    ZeroIsBadPipe,
    SelectOnFocusDirective
  ],
  imports: [
    CommonModule
  ], 
  exports: [
    InsertSpaceBeforeCapitalPipe,
    ResistanceBandColorPipe,
    ZeroIsBadPipe,
    SelectOnFocusDirective
  ]
})
export class SharedModule { }
