//Angular imports
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

//Third-Party imports

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
import { AuthService } from './core/auth.service';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginComponent } from './login/login.component';
import { UserSelectNewComponent } from './user-select-new/user-select-new.component';


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

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    UserSelectComponent,
    AccessDeniedComponent,
    WelcomeComponent,
    QuickActionsComponent,
    UserOverviewComponent,
    LoginComponent,
    UserSelectNewComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    CoreModule,
    HttpClientModule,
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
