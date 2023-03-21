import { Component, HostListener } from "@angular/core";

@Component({
  template: ''
})
export abstract class CheckForUnsavedData {
  public abstract hasUnsavedData(): boolean;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
      if (this.hasUnsavedData()) {
          $event.returnValue = true;
      }
  }  
}