import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rating'
})
export class RatingPipe implements PipeTransform {

  transform(value: number): string {
    switch(value) {
      case 0:
        return 'N/A';
      case 1:
        return 'Bad';
      case 2:
        return 'Poor';
      case 3:
        return 'OK';
      case 4:
        return 'Good';
      case 5:
        return 'Excellent';
      default:
        return 'Unknown';
    }
  }

}
