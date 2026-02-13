import { Directive, ElementRef, inject, OnDestroy, OnInit, output } from '@angular/core';

@Directive({
  selector: '[wtInfiniteScroll]',
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {

  scrolled = output<void>();

  private _observer?: IntersectionObserver;
  private _element: ElementRef = inject(ElementRef);

  public ngOnInit(): void {
    const options = {
      root: null,
      threshold: 0.1
    };

    this._observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.scrolled.emit();
      }
    }, options);

    this._observer.observe(this._element.nativeElement);
  }

  public ngOnDestroy(): void {
    this._observer?.disconnect();
  }

}
