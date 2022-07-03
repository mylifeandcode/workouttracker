import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'resistanceBandColor'
})
export class ResistanceBandColorPipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) {}

  public transform(value: string | null): SafeHtml {
    if (!value) return '';
    
    const bands = value.split(',');
    let output: string = '';

    for(let x: number = 0; x < bands.length; x++) {
      bands[x] = bands[x].trim();
      output += `<span style='color: ${bands[x]}; text-shadow: 1px 1px #000000;'>${bands[x]}</span>`;
      if(x < (bands.length - 1))
        output += ', ';
    }

    return this._sanitizer.bypassSecurityTrustHtml(output);
  }

}
