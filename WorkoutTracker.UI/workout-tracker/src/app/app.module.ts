//Angular imports
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

//Third-Party imports

import { ModalModule } from 'ngx-bootstrap/modal'; //TODO: Deprecate in favor of PrimeNg dialog

//My imports
//Modules
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

//Services
import { ConfigService } from './core/config.service';
import { UserService } from './core/user.service';

//Components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './nav/nav.component';
import { UserSelectComponent } from './user-select/user-select.component';

//Other
import { environment } from 'environments/environment';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { CookieService } from 'ng2-cookies/cookie';
import { AuthService } from './core/auth.service';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Config } from './core/models/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginComponent } from './login/login.component';

function initializeApp(
  configService: ConfigService, 
  userService: UserService, 
  authService: AuthService, 
  http: HttpClient): () => Observable<any> {
  return () => http.get("config.json")
    .pipe(
      tap((config: Config) => {
        console.log("Loaded config: ", config);
        configService.init(config);
        authService.init();
        authService.restoreUserSessionIfApplicable(); 
        userService.init();
      })
    );
}

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    UserSelectComponent,
    UserSettingsComponent,
    AccessDeniedComponent,
    WelcomeComponent,
    QuickActionsComponent,
    UserOverviewComponent,
    LoginComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    CoreModule,
    HttpClientModule,
    ModalModule.forRoot(),
    ProgressSpinnerModule, 
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService, UserService, AuthService, HttpClient],
      multi: true
    },
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
