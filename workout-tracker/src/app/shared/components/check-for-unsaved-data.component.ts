import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(window:beforeunload)': 'unloadNotification($event)',
    },
})
export abstract class CheckForUnsavedDataComponent {

  /*
  Originally, I wanted this to just be an abstract class to be extended by Component classes, but it *has* to be
  a component to be used with the UnsavedChangesGuard it was created for.
  */

  public abstract hasUnsavedData(): boolean;

  unloadNotification($event: BeforeUnloadEvent): void {
    if (this.hasUnsavedData()) {
      $event.returnValue = true;
    }
  }
}