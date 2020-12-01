import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { UserSelectComponent } from './user-select/user-select.component';
import { CookieService } from 'ng2-cookies';
import { ConfigService } from './core/config.service';
import { environment } from 'environments/environment';
import { SharedModule } from './shared/shared.module';


export function initializeApp(configSvc: ConfigService) {
  return () => {
    configSvc.init(environment);
  };
}


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    UserSelectComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule, 
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule, 
    ModalModule.forRoot(), 
    CoreModule, 
    SharedModule
  ],
  providers: [
    CookieService, 
    {
      provide: APP_INITIALIZER, 
      useFactory: initializeApp, 
      deps: [ConfigService], 
      multi: true
    }    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
