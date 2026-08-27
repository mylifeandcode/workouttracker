import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './_services/notification/notification.service';
import { ReportedErrorRegistry } from './_services/error-reporting/reported-error-registry.service';

/**
 * Catches everything GlobalHttpErrorInterceptor can't: template and lifecycle
 * errors, rejected promises (including any that escape a Signal Forms submit()), and
 * errors from window.onerror, which provideBrowserGlobalErrorListeners() routes here.
 *
 * Without this, a zoneless app reports unhandled errors to the console and nowhere
 * else — a component can fail silently and simply render nothing.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  /*
  Injector rather than injecting NotificationService directly: ErrorHandler is
  constructed very early, and eagerly pulling in the notification service — and with
  it the CDK overlay, DOCUMENT and animations — risks a premature or cyclic DI
  failure that would break the error handler itself. Resolve it lazily, at the point
  we actually need to show something.
  */
  private _injector = inject(Injector);

  public handleError(error: unknown): void {

    //First and unconditionally: provideBrowserGlobalErrorListeners() calls
    //preventDefault(), so the browser will not log this for us.
    console.error('[Unhandled error]', error);

    if (this._injector.get(ReportedErrorRegistry).wasReported(error)) return;

    /*
    GlobalHttpErrorInterceptor owns every HTTP failure: either it already reported
    this one, or the caller passed selfHandled() and owns the presentation itself.
    Either way, notifying from here would duplicate or override that.
    */
    if (error instanceof HttpErrorResponse) return;

    this._injector.get(NotificationService).error(
      'Something went wrong',
      'An unexpected error occurred. Reload the page if the problem continues.');
  }
}
