import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'targetAreas',
})
export class TargetAreasPipe implements PipeTransform {

  transform(value: string[] | undefined): string {
    if (!value)
      return '';

    return value.join(', ');
  }

}
