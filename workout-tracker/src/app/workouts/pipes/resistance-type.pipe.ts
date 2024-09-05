import { Pipe, PipeTransform } from '@angular/core';
import { ResistanceType } from '../enums/resistance-type';

@Pipe({
    name: 'resistanceType',
    standalone: true
})
export class ResistanceTypePipe implements PipeTransform {

  transform(value: ResistanceType | undefined, capitalizeEachWord: boolean = true): string {
    //Maybe a generic enum pipe would be better here, but it wouldn't add spaces 
    //between the words. Can I use 2 pipes at once, and make use of InserSpaceBeforeCapitalPipe?
  
    if(value === undefined)
      return '';

    switch(+value) { //Plus added because of error that was occurring after Angular compiler options were added to tsconfig.json. See https://stackoverflow.com/questions/45197320/why-does-a-switch-statement-on-an-enum-throw-not-comparable-to-type-error. I also found that the error went away if I started the enum at 1, but that would cause a mismatch between it and the .NET enum.
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
