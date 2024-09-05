import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSelectedGuard } from './guards/user-selected.guard';
import { EnsureModuleLoadedOnceGuard } from './guards/ensure-module-loaded-once.guard';
import { Optional } from '@angular/core';
import { SkipSelf } from '@angular/core';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { NavComponent } from './nav/nav.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserSelectComponent } from './user-select/user-select.component';
import { UserSelectNewComponent } from './user-select-new/user-select-new.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from 'app/app-routing.module';

@NgModule({
    imports: [
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    AccessDeniedComponent,
    HomeComponent,
    LoginComponent,
    NavComponent,
    QuickActionsComponent,
    UserOverviewComponent,
    UserSelectComponent,
    UserSelectNewComponent,
    WelcomeComponent
],
    exports: [
        AccessDeniedComponent,
        HomeComponent,
        LoginComponent,
        NavComponent,
        QuickActionsComponent,
        UserOverviewComponent,
        UserSelectComponent,
        UserSelectNewComponent,
        WelcomeComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        UserSelectedGuard
    ] //UserService is provided in root
})
export class CoreModule extends EnsureModuleLoadedOnceGuard {

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }

}

