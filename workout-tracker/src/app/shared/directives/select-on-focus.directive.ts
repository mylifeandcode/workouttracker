import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[wtSelectOnFocus]',
    host: {
        '(focus)': 'onFocus()',
    },
})
export class SelectOnFocusDirective {
  private _element = inject(ElementRef);


  onFocus(): void {
    this._element.nativeElement.select();
  }

}
