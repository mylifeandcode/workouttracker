import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from 'app/core/config.service';

@Pipe({
  name: 'resistanceAmount'
})
export class ResistanceAmountPipe implements PipeTransform {

  private static _unitOfMass: string = '';

  constructor(private _configService: ConfigService) {}

  transform(value: number | null): string {
    if (value == null) return '';
    
    if (ResistanceAmountPipe._unitOfMass == '') {
      console.log('yar!');
      ResistanceAmountPipe._unitOfMass = this._configService.get('unitOfMass') ?? 'lb';
    }

    if (value == 1)
      return `${value} ${ResistanceAmountPipe._unitOfMass}`;
    else
      return `${value} ${ResistanceAmountPipe._unitOfMass}s`;
  }

}
