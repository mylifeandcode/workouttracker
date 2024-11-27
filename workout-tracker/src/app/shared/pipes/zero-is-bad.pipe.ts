import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'zeroIsBad',
    standalone: true
})
export class ZeroIsBadPipe implements PipeTransform {
  private _sanitizer = inject(DomSanitizer);

  
  transform(value: number): SafeHtml {
    if(value > 0) 
      return value;
    else
      return this._sanitizer.bypassSecurityTrustHtml(`<span style='color: red'>${value}</span>`);  
  }

}
