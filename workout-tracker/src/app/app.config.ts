import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfigService } from './core/_services/config/config.service';
import { UserService } from './core/_services/user/user.service';
import { AuthService } from './core/_services/auth/auth.service';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Observable, tap } from 'rxjs';
import en from '@angular/common/locales/en';
import { registerLocaleData } from '@angular/common';
import { provideNzI18n, en_US } from 'ng-zorro-antd/i18n';
registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    //provideZoneChangeDetection({ eventCoalescing: true }),
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
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideNzI18n(en_US)
  ]
};

function initializeApp(
  configService: ConfigService,
  userService: UserService,
  authService: AuthService,
  http: HttpClient): () => Observable<unknown> {
  console.log("APP IS INITIALIZING...");
  return (): Observable<object> => http.get("config.json")
    .pipe(
      tap((config: object) => {
        console.log("Loaded config: ", config);
        configService.init(config);
        authService.init();
        authService.restoreUserSessionIfApplicable();
        userService.init();
      })
    );
}
