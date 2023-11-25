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
import { ConfigService } from './core/services/config/config.service';
import { UserService } from './core/services/user/user.service';

//Components
import { AppComponent } from './app.component';

//Other
import { AuthService } from './core/services/auth/auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


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
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    CoreModule,
    HttpClientModule,
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
