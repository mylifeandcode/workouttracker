import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'p-table', 
  template: ''
})
export class TableComponentMock {
  @Input()
  class: string = '';
  
  @Input()
  value: any; 
  
  @Input()
  paginator: boolean = false; 
  
  @Input()
  rows: number = 0; 

  @Input()
  columns: any; 
  
  @Input()
  lazy: boolean = false; 
  
  @Output()
  onLazyLoad = new EventEmitter<any>(); 

  @Input()
  totalRecords: number = 0; 
  
  @Input()
  loading: boolean = false;
}