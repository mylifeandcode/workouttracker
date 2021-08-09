//Angular imports
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

//Third-Party imports
import { CookieService } from 'ng2-cookies';
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


export function initializeApp(configService: ConfigService, userService: UserService) {
  return () => {
    configService.init(environment);
    userService.restoreUserSessionIfApplicable();
  };
}


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    UserSelectComponent,
    UserSettingsComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    CoreModule,
    HttpClientModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService, UserService],
      multi: true
    },
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
