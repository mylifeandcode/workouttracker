import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from './_services/config/config.service';
import { NotificationService } from './_services/notification/notification.service';
import { ReportedErrorRegistry } from './_services/error-reporting/reported-error-registry.service';
import { AppError } from './_http/app-error';
import { toAppError } from './_http/app-error.mapper';
import { SELF_HANDLED_HTTP_ERRORS } from './_http/http-error-context';

/**
 * Reports every unhandled API failure to the user, once, in plain language.
 *
 * ORDERING IS LOAD-BEARING: this must be registered ahead of AuthInterceptor so it
 * ends up OUTSIDE it. Angular builds the chain with reduceRight, so the first
 * HTTP_INTERCEPTORS entry is the outermost one, producing:
 *
 *     backend$ -> Auth.pipe(catchError) -> GlobalHttpError.pipe(tap({error}))
 *
 * That order is what makes a silent token refresh silent: AuthInterceptor's
 * catchError swaps the 401 for the replayed request's SUCCESS notification, so we
 * never see an error at all. A replay that genuinely fails still propagates out to
 * us and is reported. Reverse the order and every expired access token produces a
 * spurious error notification. See global-http-error.interceptor.spec.ts.
 *
 * WHY THE OPT-OUT IS ON THE REQUEST, not on a downstream catchError: our error
 * operator is applied when HttpClient builds the observable, so it sits upstream of
 * everything a service or component can add afterwards:
 *
 *     backend error
 *       -> AuthInterceptor  catchError     (interceptor)
 *       -> this             tap({error})   (interceptor)  <-- we notify HERE
 *       -> service          map / tap
 *       -> component        catchError / finalize
 *       -> component        subscribe({error})            <-- runs LAST
 *
 * AuthService.logIn() proves why that matters: its catchError(() => of(false)) is how
 * the login screen renders "Login failed.", but it runs after us, so without an
 * opt-out we'd notify about the raw 401 first. Callers that own their error
 * presentation pass selfHandled() instead.
 */
@Injectable()
export class GlobalHttpErrorInterceptor implements HttpInterceptor {

  private _configService = inject(ConfigService);
  private _notificationService = inject(NotificationService);
  private _reportedErrors = inject(ReportedErrorRegistry);

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if (!this.shouldReport(request)) return next.handle(request);

    /*
    tap, deliberately, NOT catchError. This must be structurally incapable of
    swallowing the failure or replacing the error object: every existing error:
    callback, catchError and finalize() in the app keeps working unchanged, and
    downstream `instanceof HttpErrorResponse` checks still match because tap
    preserves the error's identity.
    */
    return next.handle(request).pipe(
      tap({ error: (error: unknown) => this.report(error, request) })
    );
  }

  private shouldReport(request: HttpRequest<unknown>): boolean {

    if (request.context.get(SELF_HANDLED_HTTP_ERRORS)) return false;

    /*
    Our own API only. This also excludes the app initializer's config.json fetch,
    which runs before ConfigService is populated and before the notification host
    can render anything.
    */
    const apiRoot = this._configService.get('apiRoot');
    return typeof apiRoot === 'string' && apiRoot.length > 0 && request.url.startsWith(apiRoot);
  }

  private report(error: unknown, request: HttpRequest<unknown>): void {
    /*
    A throw in here would be forwarded downstream by tap IN PLACE OF the original
    error, so a bug in the mapper or in ng-zorro must never escape this method.
    */
    try {
      this._reportedErrors.markReported(error);

      const appError = toAppError(error, request.method);

      //The single seam for adding real telemetry later; everything needed is here.
      console.error(
        `[HTTP ${appError.status}] ${request.method} ${request.url}`,
        appError.technicalMessage,
        appError.traceId ? `traceId: ${appError.traceId}` : '',
        error);

      this._notificationService.error(
        this.titleFor(appError, request.method),
        appError.userMessage,
        { sticky: appError.isNetworkError || appError.status >= 500 });
    }
    catch (reportingFailure) {
      console.error('GlobalHttpErrorInterceptor failed while reporting an error', reportingFailure);
    }
  }

  private titleFor(appError: AppError, method: string): string {
    if (appError.isNetworkError) return "Can't reach the server";
    if (appError.status === 401) return 'Signed out';
    if (appError.status === 403) return 'Not allowed';

    return method.toUpperCase() === 'GET' ? "Couldn't load data" : "Couldn't save changes";
  }
}
