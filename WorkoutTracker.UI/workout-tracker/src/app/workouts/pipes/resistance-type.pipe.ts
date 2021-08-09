import { Pipe, PipeTransform } from '@angular/core';
import { ResistanceType } from '../enums/resistance-type';

@Pipe({
  name: 'resistanceType'
})
export class ResistanceTypePipe implements PipeTransform {

  transform(value: ResistanceType): string {
    //Maybe a generic enum pipe would be better here, but it wouldn't add spaces 
    //between the words. Can I use 2 pipes at once, and make use of InserSpaceBeforeCapitalPipe?
  
    switch(value) {
      case ResistanceType.BodyWeight:
        return 'Body Weight';
      case ResistanceType.FreeWeight:
        return 'Free Weight';
      case ResistanceType.MachineWeight:
        return 'Machine Weight';
      case ResistanceType.Other:
        return 'Other';
      case ResistanceType.ResistanceBand:
        return 'Resistance Band';
      default:
        throw new Error("Unknown ResistanceType: " + value);
    }
    
  }

}
