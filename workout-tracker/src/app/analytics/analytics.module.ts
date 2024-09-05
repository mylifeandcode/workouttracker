import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { WorkoutProgressComponent } from './workout-progress/workout-progress.component';
import { WorkoutsModule } from 'app/workouts/workouts.module';
import { ChartModule } from 'primeng/chart';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';


@NgModule({
    imports: [
    CommonModule,
    AnalyticsRoutingModule,
    ChartModule,
    DropdownModule,
    FormsModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    TabViewModule,
    WorkoutsModule,
    AnalyticsDashboardComponent,
    WorkoutProgressComponent
]
})
export class AnalyticsModule { }
