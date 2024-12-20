import { Pipe, PipeTransform } from '@angular/core';

//This code was found (with a different name) at 
//https://pintoservice.wordpress.com/2016/02/02/humanize-pipe-angular-2/

@Pipe({
    name: 'insertSpaceBeforeCapital',
    standalone: true
})
export class InsertSpaceBeforeCapitalPipe implements PipeTransform {

  public transform(value: string): string {
    if ((typeof value) !== 'string')
      return value;

    value = value.split(/(?=[A-Z])/).join(' ');
    value = value[0].toUpperCase() + value.slice(1);
    return value;
  }

}
