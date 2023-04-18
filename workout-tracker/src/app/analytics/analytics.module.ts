import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SharedModule } from 'app/shared/shared.module';
import { WorkoutProgressComponent } from './workout-progress/workout-progress.component';
import { WorkoutsModule } from 'app/workouts/workouts.module';
import { ChartModule } from 'primeng/chart';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AnalyticsDashboardComponent,
    WorkoutProgressComponent
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    FormsModule,
    ProgressSpinnerModule,
    SharedModule,
    WorkoutsModule,
    ChartModule
  ]
})
export class AnalyticsModule { }
