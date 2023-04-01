import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[wtSelectOnFocus]'
})
export class SelectOnFocusDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('focus') onMouseLeave() {
    this._el.nativeElement.focus();
  }

}
