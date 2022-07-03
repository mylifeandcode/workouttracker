import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(durationInSeconds: number | null, precise: boolean = false): string {
    if (!durationInSeconds) return '';
    
    if (durationInSeconds <= 0)
      return "0s";

    const dateString = new Date(durationInSeconds * 1000).toISOString();

    //substring is kind of weird. The end parameter is defined as:
    //Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end.

    const hours = Number(dateString.substring(11, 13));
    const minutes = Number(dateString.substring(14, 16));
    const seconds = Number(dateString.substring(17, 19));

    return this.getFormattedHours(hours) + this.getFormattedMinutes(hours, minutes) + this.getFormattedSeconds(seconds, precise);

  }

  private getFormattedHours(hours: number): string {
    if (hours == 0)
      return '';
    else
      return hours.toString() + 'h';
  }

  private getFormattedMinutes(hours: number, minutes: number): string {
    if (hours == 0 && minutes == 0)
      return '';
    else
      return minutes.toString() + 'm';
  }

  private getFormattedSeconds(seconds: number, precise: boolean): string {
    if(!precise)
      return '';
    else
      return seconds.toString() + 's';
  }

}
