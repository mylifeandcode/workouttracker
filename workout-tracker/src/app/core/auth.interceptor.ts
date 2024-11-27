import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './_services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private _authService = inject(AuthService);


  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if (this._authService.token) {
      const authRequest = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + this._authService.token)
      });
      //console.log("passing token!");
      return next.handle(authRequest);
    }
    else {
      //console.log("not passing token!");
      return next.handle(request);
    }
  }
}
