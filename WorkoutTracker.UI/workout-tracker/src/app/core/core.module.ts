import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSelectedGuard } from './guards/user-selected.guard';
import { EnsureModuleLoadedOnceGuard } from './guards/ensure-module-loaded-once.guard';
import { Optional } from '@angular/core';
import { SkipSelf } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [],
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

