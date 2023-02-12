import { Pipe, PipeTransform } from '@angular/core';
import { ExerciseTargetAreaLink } from '../models/exercise-target-area-link';

@Pipe({
  name: 'targetAreas'
})
export class TargetAreasPipe implements PipeTransform {

  transform(value: ExerciseTargetAreaLink[] | undefined): string {
    if (!value)
      return '';

    let targetAreaNames = value.map(link => link.targetArea.name);
    return targetAreaNames.join(', ');
  }

}
