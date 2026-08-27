import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, merge, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from './_services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private _authService = inject(AuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const authRequest = this.addToken(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isAuthUrl(request.url)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>): HttpRequest<unknown> {
    if (this._authService.token) {
      return request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + this._authService.token)
      });
    }
    return request;
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this._authService.isRefreshing) {
      this._authService.isRefreshing = true;
      this._authService.refreshTokenSubject.next(null);

      return this._authService.refreshAccessToken().pipe(
        switchMap((success: boolean) => {
          this._authService.isRefreshing = false;
          if (success) {
            this._authService.refreshTokenSubject.next(this._authService.token);
            return next.handle(this.addToken(request));
          } else {
            this.announceRefreshFailure();
            this._authService.logOut();
            return throwError(() => new HttpErrorResponse({ status: 401 }));
          }
        }),
        catchError((err) => {
          this._authService.isRefreshing = false;
          this.announceRefreshFailure();
          this._authService.logOut();
          return throwError(() => err);
        })
      );
    } else {
      /*
      Another request is already refreshing — wait for it to finish.

      We listen for BOTH outcomes. Waiting only on refreshTokenSubject would hang
      forever when the refresh fails, because nothing is ever pushed to it in that
      case: the request would never emit, error, or complete, so finalize() never
      runs and the caller's spinner sticks permanently.
      */
      return merge(
        this._authService.refreshTokenSubject.pipe(filter(token => token != null), map(() => true)),
        this._authService.refreshFailed$.pipe(map(() => false))
      ).pipe(
        take(1),
        switchMap((refreshSucceeded: boolean) => refreshSucceeded
          ? next.handle(this.addToken(request))
          : throwError(() => new HttpErrorResponse({ status: 401 })))
      );
    }
  }

  private announceRefreshFailure(): void {
    this._authService.refreshFailed$.next();
  }

  /*
  URLs whose 401s must NOT trigger a refresh attempt.

  /auth/revoke belongs here even though it isn't a token-issuing endpoint: logOut()
  fires it precisely when the token may already be dead, and without this its 401
  would trigger a refresh, which fails, which calls logOut() again.
  */
  private isAuthUrl(url: string): boolean {
    return url.includes('/auth/refresh')
      || url.includes('/auth/login')
      || url.includes('/auth/revoke');
  }
}
