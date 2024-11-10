import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'rating',
    standalone: true
})
export class RatingPipe implements PipeTransform {

  public transform(value: number | null): string {
    if (value == null) return '';
    
    if(this.isWholeNumber(value))
      return this.getAbsoluteRating(value);
    else
      return this.getAverageRating(value);
  }

  private isWholeNumber(value: number): boolean {
    return (value - Math.floor(value)) == 0; 
  }

  private getAbsoluteRating(value: number): string {
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

  private getAverageRating(value: number): string {
    switch(true) {
      case (value < 1):
        return 'Worse than Bad';

      case (value > 1 && value <= 1.49):
        return 'Mostly Bad';

      case (value >= 1.5 && value < 2):
        return 'Almost Poor';

      case (value > 2 && value < 2.49):
        return 'Mostly Poor';

      case (value >= 2.5 && value < 3):
        return 'Almost OK';

      case (value > 3 && value < 3.49):
        return 'Mostly OK';

      case (value >= 3.5 && value < 4):        
        return 'Almost Good';

      case (value > 4 && value < 4.49):
        return 'Mostly Good';

      case (value >= 4.5 && value < 5):
        return 'Almost Excellent';
        
      default:
        return 'Unknown';
    }
  }

}
