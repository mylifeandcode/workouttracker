import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './_services/auth/auth.service';

/*
With the BFF this interceptor no longer touches tokens: the browser attaches the session cookie by itself and the BFF
adds the bearer token and refreshes it. Two jobs remain.
*/
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private _authService = inject(AuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    return next.handle(this.addCsrfHeader(request)).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.isApiUrl(request.url) && this._authService.isUserLoggedIn) {
          // The BFF ended the session (logged out elsewhere, or its refresh token was rejected). Rethrow so the
          // caller and the global error interceptor still see the 401; we only reset local state and leave.
          this._authService.handleSessionExpired();
        }
        return throwError(() => error);
      })
    );
  }

  /*
  Cookies are sent automatically, so a hostile site could make the browser fire requests at the BFF. The BFF rejects
  any state-changing request lacking this custom header, which a cross-site request cannot add. Only same-origin
  (relative) URLs get it; it has no business going to any third party.
  */
  private addCsrfHeader(request: HttpRequest<unknown>): HttpRequest<unknown> {
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    if (isSafeMethod || /^[a-z][a-z0-9+.-]*:\/\//i.test(request.url)) {
      return request;
    }
    return request.clone({ headers: request.headers.set('X-CSRF', '1') });
  }

  /*
  Only a 401 from a data call means "your session is gone". /bff/* is excluded: a 401 from /bff/login is simply a
  failed login (the login screen handles it) and a 401 from /bff/user is the normal "not signed in" answer at startup.
  */
  private isApiUrl(url: string): boolean {
    return url.includes('/api/');
  }
}
