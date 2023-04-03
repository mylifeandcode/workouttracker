import { Component, Input } from "@angular/core";

@Component({
  selector: 'p-dialog', 
  template: ''
})
export class DialogComponentMock {
  @Input() 
  visible: boolean;
  
  @Input()
  style: any; 
  
  @Input()
  header: string; 
  
  @Input()
  modal: boolean; 
  
  @Input()
  styleClass: string;
}
