import { Component, HostListener } from "@angular/core";

@Component({
  template: ''
})
export abstract class CheckForUnsavedDataComponent {

  /*
  Originally, I wanted this to just be an abstract class to be extended by Component classes, but it *has* to be 
  a component to be used with the UnsavedChangesGuard it was created for.
  */

  public abstract hasUnsavedData(): boolean;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true;
    }
  }
}