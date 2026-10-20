import { ApplicationConfig, ErrorHandler, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
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
import { windowProvider } from './core/_providers/window.provider';
registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    importProvidersFrom(BrowserModule, CommonModule),
    provideAppInitializer(() => {
      const initializerFn = (initializeApp)(inject(ConfigService), inject(UserService), inject(AuthService), inject(HttpClient));
      return initializerFn();
    }),
    /*
    Angular builds the interceptor chain with reduceRight, so the FIRST entry here is the OUTERMOST one.

    This order used to be load-bearing: AuthInterceptor swallowed a 401, refreshed the token in the browser and replayed
    the request, so GlobalHttpErrorInterceptor had to wrap it or every silent refresh raised a spurious error
    notification. The BFF now refreshes tokens server-side and AuthInterceptor never swallows an error, so either order
    behaves the same. This one is kept because the global error handler reporting what the auth layer rethrows reads
    naturally.
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
    windowProvider,
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
