import { Pipe, PipeTransform, inject } from '@angular/core';
import { ConfigService } from 'app/core/_services/config/config.service';

@Pipe({
    name: 'resistanceAmount',
    standalone: true
})
export class ResistanceAmountPipe implements PipeTransform {
  private _configService = inject(ConfigService);


  private static _unitOfMass: string = '';

  transform(value: number | null, isResistanceBand: boolean = false): string {
    if (value == null) return '';
    
    if (ResistanceAmountPipe._unitOfMass == '') {
      ResistanceAmountPipe._unitOfMass = this._configService.get('unitOfMass') ?? 'lb';
    }

    if (value == 1)
      return `${value} ${ResistanceAmountPipe._unitOfMass} ${isResistanceBand ? 'max' : ''}`;
    else
      return `${value} ${ResistanceAmountPipe._unitOfMass}s ${isResistanceBand ? 'max' : ''}`;
  }

}
