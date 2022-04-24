import { Pipe, PipeTransform } from '@angular/core';
import { ResistanceType } from '../enums/resistance-type';

@Pipe({
  name: 'resistanceType'
})
export class ResistanceTypePipe implements PipeTransform {

  transform(value: ResistanceType, capitalizeEachWord: boolean = true): string {
    //Maybe a generic enum pipe would be better here, but it wouldn't add spaces 
    //between the words. Can I use 2 pipes at once, and make use of InserSpaceBeforeCapitalPipe?
  
    switch(value) {
      case ResistanceType.BodyWeight:
        return (capitalizeEachWord ? 'Body Weight' : 'body weight');
      case ResistanceType.FreeWeight:
        return (capitalizeEachWord ? 'Free Weight' : 'free weight');
      case ResistanceType.MachineWeight:
        return (capitalizeEachWord ? 'Machine Weight' : 'machine weight');
      case ResistanceType.Other:
        return (capitalizeEachWord ? 'Other' : 'other');
      case ResistanceType.ResistanceBand:
        return (capitalizeEachWord ? 'Resistance Band' : 'resistance band');
      default:
        throw new Error("Unknown ResistanceType: " + value);
    }
    
  }

}
