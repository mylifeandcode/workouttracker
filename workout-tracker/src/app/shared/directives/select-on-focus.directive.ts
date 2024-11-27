import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
    selector: '[wtSelectOnFocus]',
    standalone: true
})
export class SelectOnFocusDirective {
  private _element = inject(ElementRef);


  @HostListener('focus') onFocus(): void {
    this._element.nativeElement.select();
  }

}
