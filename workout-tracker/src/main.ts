import { enableProdMode, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { ConfigService } from './app/core/services/config/config.service';
import { UserService } from './app/core/services/user/user.service';
import { AuthService } from './app/core/services/auth/auth.service';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { CoreModule } from './app/core/core.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';

function initializeApp(
  configService: ConfigService,
  userService: UserService,
  authService: AuthService,
  http: HttpClient): () => Observable<any> {
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



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(AppRoutingModule, BrowserModule, CommonModule, CoreModule, ReactiveFormsModule),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [ConfigService, UserService, AuthService, HttpClient],
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
});

//PrimeNg setup instructions: https://www.primefaces.org/primeng/showcase/#/setup
