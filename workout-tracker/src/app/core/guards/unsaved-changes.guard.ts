import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { CheckForUnsavedData } from '../check-for-unsaved-data';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CheckForUnsavedData> {
  canDeactivate(component: CheckForUnsavedData) {
    if (component.hasUnsavedData()) {
      return window.confirm("There are unsaved changes. Do you still want to leave this page?");
    }
    else {
      return true;
    }
  }
}
