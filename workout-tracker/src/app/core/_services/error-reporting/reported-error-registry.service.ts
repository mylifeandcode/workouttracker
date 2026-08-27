import { Injectable } from '@angular/core';

/**
 * Tracks which error objects have already been surfaced to the user, so
 * GlobalErrorHandler doesn't report a second time something
 * GlobalHttpErrorInterceptor already handled.
 *
 * A WeakSet rather than an `error.__reported = true` property flag, because:
 *
 *  - Property assignment can THROW. ES modules are strict mode, so assigning to a
 *    frozen object or to a string primitive raises a TypeError — and doing that
 *    inside the error path is the worst possible place to introduce a crash.
 *  - A flag would leak into JSON.stringify(error) for any future telemetry payload,
 *    and would mutate an object that shareReplay(1) may have handed to several
 *    subscribers at once.
 *  - A WeakSet needs no cleanup and can't grow unbounded.
 *
 * Injectable rather than a module-level const so it resets with the injector between
 * specs instead of leaking state across them.
 */
@Injectable({ providedIn: 'root' })
export class ReportedErrorRegistry {

  private _reported = new WeakSet<object>();

  /** No-op for primitives — WeakSet.add() throws on a string or number. */
  public markReported(error: unknown): void {
    if (this.isTrackable(error)) this._reported.add(error);
  }

  public wasReported(error: unknown): boolean {
    return this.isTrackable(error) && this._reported.has(error);
  }

  private isTrackable(error: unknown): error is object {
    return typeof error === 'object' && error !== null;
  }
}
