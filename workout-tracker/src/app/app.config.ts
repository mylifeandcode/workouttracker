import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
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
