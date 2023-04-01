import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[wtSelectOnFocus]'
})
export class SelectOnFocusDirective {

  constructor(private _element: ElementRef) {}

  @HostListener('focus') onFocus() {
    this._element.nativeElement.select();
  }

}
