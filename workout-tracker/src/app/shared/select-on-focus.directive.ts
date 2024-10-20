import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[wtSelectOnFocus]',
    standalone: true
})
export class SelectOnFocusDirective {

  constructor(private _element: ElementRef) {}

  @HostListener('focus') onFocus(): void {
    this._element.nativeElement.select();
  }

}
