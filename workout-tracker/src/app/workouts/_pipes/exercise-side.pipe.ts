import { Pipe, PipeTransform } from '@angular/core';
import { ExerciseSide } from '../workout/_enums/exercise-side';

@Pipe({
    name: 'exerciseSide',
    standalone: true
})
export class ExerciseSidePipe implements PipeTransform {

  transform(value: ExerciseSide | null): string {
    if (value == null) return "";

    switch(+value) {
      case ExerciseSide.Left:
        return " (L)";
      case ExerciseSide.Right:
        return " (R)";
      default:
        return "";
    }
  }

}
