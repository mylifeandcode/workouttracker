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
  sourceHeader: string;
  
  @Input()
  targetHeader: string;

  @Input()
  showSourceControls: boolean; 
  
  @Input()
  showTargetControls: boolean;

  @Input()
  sourceStyle: any; 
  
  @Input()
  targetStyle: any;

  @Input()
  dragdrop: boolean;
  
}
