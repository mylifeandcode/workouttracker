import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { CheckForUnsavedDataComponent } from '../check-for-unsaved-data.component';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CheckForUnsavedDataComponent> {
  canDeactivate(component: CheckForUnsavedDataComponent) {
    if (component.hasUnsavedData()) {
      return window.confirm("There are unsaved changes. Do you still want to leave this page?");
    }
    else {
      return true;
    }
  }
}
