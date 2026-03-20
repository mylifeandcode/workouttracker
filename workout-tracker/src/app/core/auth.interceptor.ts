import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
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
            this._authService.logOut();
            return throwError(() => new HttpErrorResponse({ status: 401 }));
          }
        }),
        catchError((err) => {
          this._authService.isRefreshing = false;
          this._authService.logOut();
          return throwError(() => err);
        })
      );
    } else {
      // Another request is already refreshing — wait for it to complete
      return this._authService.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => next.handle(this.addToken(request)))
      );
    }
  }

  private isAuthUrl(url: string): boolean {
    return url.includes('/auth/refresh') || url.includes('/auth/login');
  }
}
