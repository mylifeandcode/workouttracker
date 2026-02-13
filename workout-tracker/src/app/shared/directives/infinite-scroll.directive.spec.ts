import { InfiniteScrollDirective } from './infinite-scroll.directive';

// Mock IntersectionObserver
class MockIntersectionObserver implements Partial<IntersectionObserver> {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [0.1];

  constructor(
    private callback: IntersectionObserverCallback,
    private options?: IntersectionObserverInit
  ) { }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  // Helper method to trigger the callback manually in tests
  triggerIntersection(isIntersecting: boolean) {
    const entries: IntersectionObserverEntry[] = [
      {
        isIntersecting,
        target: document.createElement('div'),
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      } as IntersectionObserverEntry,
    ];
    this.callback(entries, this as IntersectionObserver);
  }
}

describe('InfiniteScrollDirective', () => {
  beforeEach(() => {
    window.IntersectionObserver = vitest.fn().mockImplementation(
      (callback, options) => new MockIntersectionObserver(callback, options)
    );
  });

  it('should create an instance', () => {
    const directive = new InfiniteScrollDirective();
    expect(directive).toBeTruthy();
  });
});
