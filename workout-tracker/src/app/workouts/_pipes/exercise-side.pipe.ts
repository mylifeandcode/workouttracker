import { Pipe, PipeTransform } from '@angular/core';
import { ExerciseSide } from '../../api';

@Pipe({
    name: 'exerciseSide',
    standalone: true
})
export class ExerciseSidePipe implements PipeTransform {

  transform(value: ExerciseSide | number | null | undefined): string {
    if (value == null) return "";

    switch(+value) {
      case ExerciseSide.LEFT:
        return " (L)";
      case ExerciseSide.RIGHT:
        return " (R)";
      default:
        return "";
    }
  }

}
