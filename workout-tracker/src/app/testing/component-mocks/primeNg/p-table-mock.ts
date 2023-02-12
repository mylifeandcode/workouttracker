import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'p-table', 
  template: ''
})
export class TableComponentMock {
  @Input()
  class: string;
  
  @Input()
  value: any; 
  
  @Input()
  paginator: boolean; 
  
  @Input()
  rows: number; 

  @Input()
  columns: any; 
  
  @Input()
  lazy: boolean; 
  
  @Output()
  onLazyLoad = new EventEmitter<any>(); 

  @Input()
  totalRecords: number; 
  
  @Input()
  loading: boolean;
}