import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'zeroIsBad'
})
export class ZeroIsBadPipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) {}
  
  transform(value: number): SafeHtml {
    if(value > 0) 
      return value;
    else
      return this._sanitizer.bypassSecurityTrustHtml(`<span style='color: red'>${value}</span>`);  
  }

}
