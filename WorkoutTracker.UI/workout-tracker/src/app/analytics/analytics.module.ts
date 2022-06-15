import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [
    AnalyticsDashboardComponent
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    ProgressSpinnerModule,
    SharedModule
  ]
})
export class AnalyticsModule { }
