import { Injectable } from '@angular/core';

import { CheckForUnsavedDataComponent } from '../../shared/components/check-for-unsaved-data.component';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard  {
  canDeactivate(component: CheckForUnsavedDataComponent): boolean {
    if (component.hasUnsavedData()) {
      return window.confirm("There are unsaved changes. Do you still want to leave this page?");
    }
    else {
      return true;
    }
  }
}
