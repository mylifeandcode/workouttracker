import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSelectedGuard } from './guards/user-selected.guard';
import { EnsureModuleLoadedOnceGuard } from './guards/ensure-module-loaded-once.guard';
import { Optional } from '@angular/core';
import { SkipSelf } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [],
  providers: [
    UserSelectedGuard
  ] //UserService is provided in root
})
export class CoreModule extends EnsureModuleLoadedOnceGuard {

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }

}

