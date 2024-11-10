import { Pipe, PipeTransform } from '@angular/core';
import { ExerciseTargetAreaLink } from '../_models/exercise-target-area-link';

@Pipe({
    name: 'targetAreas',
    standalone: true
})
export class TargetAreasPipe implements PipeTransform {

  transform(value: ExerciseTargetAreaLink[] | undefined): string {
    if (!value)
      return '';

    const targetAreaNames = value.map(link => link.targetArea?.name);
    return targetAreaNames.join(', ');
  }

}
