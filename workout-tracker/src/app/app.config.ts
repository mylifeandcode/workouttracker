import { ApplicationConfig, ErrorHandler, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { ConfigService } from './core/_services/config/config.service';
import { UserService } from './core/_services/user/user.service';
import { AuthService } from './core/_services/auth/auth.service';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';
import { GlobalHttpErrorInterceptor } from './core/global-http-error.interceptor';
import { GlobalErrorHandler } from './core/global-error-handler';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Observable, switchMap, tap } from 'rxjs';
import en from '@angular/common/locales/en';
import { registerLocaleData } from '@angular/common';
import { provideNzI18n, en_US } from 'ng-zorro-antd/i18n';
registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    importProvidersFrom(BrowserModule, CommonModule, ReactiveFormsModule),
    provideAppInitializer(() => {
      const initializerFn = (initializeApp)(inject(ConfigService), inject(UserService), inject(AuthService), inject(HttpClient));
      return initializerFn();
    }),
    /*
    INTERCEPTOR ORDER IS LOAD-BEARING — do not reorder these two.

    Angular builds the interceptor chain with reduceRight, so the FIRST entry here is
    the OUTERMOST one. GlobalHttpErrorInterceptor has to wrap AuthInterceptor: that's
    what lets a silent token refresh stay silent, because AuthInterceptor's catchError
    replaces the 401 with the replayed request's success before the error interceptor
    ever sees it. Swap these and every expired access token raises a spurious error
    notification — a regression that only reproduces once a token actually expires.

    Covered by global-http-error.interceptor.spec.ts, which asserts both orders.
    */
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalHttpErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideNzI18n(en_US),
    //Signal Forms doesn't add the legacy ng-* status classes by default; this restores them
    //app-wide (via the compat helper) so existing .ng-invalid.ng-touched styling keeps working.
    provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })
  ]
};

function initializeApp(
  configService: ConfigService,
  userService: UserService,
  authService: AuthService,
  http: HttpClient): () => Observable<unknown> {
  console.log("APP IS INITIALIZING...");
  return (): Observable<unknown> => http.get("config.json")
    .pipe(
      tap((config: object) => {
        console.log("Loaded config: ", config);
        configService.init(config);
        authService.init();
      }),
      // Wait for session restoration (including any token refresh) to fully
      // resolve before bootstrap completes. The router won't activate a route
      // until every app initializer finishes, so guards never run against
      // unsettled auth state — no expired-token flash before the redirect.
      switchMap(() => authService.restoreUserSessionIfApplicable()),
      tap(() => userService.init())
    );
}
