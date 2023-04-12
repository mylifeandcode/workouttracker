import { Component, Input } from "@angular/core";

@Component({
  selector: 'p-confirmDialog', 
  template: ''
})
export class ConfirmDialogComponentMock {
  
  @Input()
  header: string = '';
  
  @Input()
  icon: string = '';
  
}