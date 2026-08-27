import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ReportedErrorRegistry } from './reported-error-registry.service';

describe('ReportedErrorRegistry', () => {

  let service: ReportedErrorRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });

    service = TestBed.inject(ReportedErrorRegistry);
  });

  it('should report an object as unreported until it is marked', () => {
    const error = new HttpErrorResponse({ status: 500 });

    expect(service.wasReported(error)).toBe(false);

    service.markReported(error);

    expect(service.wasReported(error)).toBe(true);
  });

  it('should track by identity, not by value', () => {
    service.markReported(new HttpErrorResponse({ status: 500 }));

    expect(service.wasReported(new HttpErrorResponse({ status: 500 }))).toBe(false);
  });

  /*
  A WeakSet is used instead of an `error.__reported = true` flag precisely because
  assigning to a primitive throws in strict mode. Marking must be a safe no-op.
  */
  it('should ignore primitives without throwing', () => {
    expect(() => service.markReported('a thrown string')).not.toThrow();
    expect(() => service.markReported(42)).not.toThrow();
    expect(() => service.markReported(null)).not.toThrow();
    expect(() => service.markReported(undefined)).not.toThrow();

    expect(service.wasReported('a thrown string')).toBe(false);
    expect(service.wasReported(null)).toBe(false);
    expect(service.wasReported(undefined)).toBe(false);
  });

  it('should handle a frozen error object', () => {
    const frozen = Object.freeze(new Error('frozen'));

    expect(() => service.markReported(frozen)).not.toThrow();
    expect(service.wasReported(frozen)).toBe(true);
  });

  it('should not mutate the error it marks', () => {
    const error = new HttpErrorResponse({ status: 500 });

    service.markReported(error);

    expect(Object.keys(error)).not.toContain('__reported');
  });
});
