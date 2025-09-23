import { Injectable } from '@angular/core';
import { IHasAuditDates } from 'app/shared/interfaces/i-has-audit-dates';
import { IMightHaveAuditDates } from 'app/shared/interfaces/i-might-have-audit-dates';
import { IHasDateRange } from 'app/shared/interfaces/i-has-date-range';
import { IMightHaveDateRange } from 'app/shared/interfaces/i-might-have-date-range';

@Injectable({
  providedIn: 'root'
})
export class DateSerializationService {
  public convertAuditDateStringsToDates<T extends IHasAuditDates | IMightHaveAuditDates>(obj: T): T {
    if (obj.createdDateTime) {
      obj.createdDateTime = new Date(obj.createdDateTime);
    }
    if (obj.modifiedDateTime) {
      obj.modifiedDateTime = new Date(obj.modifiedDateTime);
    }
    return obj;
  }

  public convertDateRangeStringsToDates<T extends IHasDateRange | IMightHaveDateRange>(obj: T): T {
    if (obj.startDateTime) {
      obj.startDateTime = new Date(obj.startDateTime);
    }
    if (obj.endDateTime) {
      obj.endDateTime = new Date(obj.endDateTime);
    }
    return obj;
  }
}
