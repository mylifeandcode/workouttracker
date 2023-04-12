import { Component, Input } from "@angular/core";

@Component({
  selector: 'p-pickList', 
  template: ''
})
export class PickListComponentMock {

  @Input()
  source: any;
  
  @Input()
  target: any;
  
  @Input()
  sourceHeader: string = '';
  
  @Input()
  targetHeader: string = '';

  @Input()
  showSourceControls: boolean = false; 
  
  @Input()
  showTargetControls: boolean = false;

  @Input()
  sourceStyle: any; 
  
  @Input()
  targetStyle: any;

  @Input()
  dragdrop: boolean = false;
  
}
