import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsertSpaceBeforeCapitalPipe } from './pipes/insert-space-before-capital.pipe';



@NgModule({
  declarations: [
    InsertSpaceBeforeCapitalPipe
  ],
  imports: [
    CommonModule
  ], 
  exports: [
    InsertSpaceBeforeCapitalPipe
  ]
})
export class SharedModule { }
