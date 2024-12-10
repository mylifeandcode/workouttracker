import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, inject, provideAppInitializer, runInInjectionContext } from '@angular/core';
import { provideRouter } from '@angular/router';
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
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(BrowserModule, CommonModule, MessageModule, ReactiveFormsModule),
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
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    MessageService, //Providing this here simplifies unit testing
    ConfirmationService
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
