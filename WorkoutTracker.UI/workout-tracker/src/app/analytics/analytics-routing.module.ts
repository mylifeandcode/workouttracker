import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UserSelectedGuard } from "app/core/guards/user-selected.guard";
import { AnalyticsDashboardComponent } from "./analytics-dashboard/analytics-dashboard.component";
import { WorkoutProgressComponent } from "./workout-progress/workout-progress.component";

const routes: Routes = [
  {
    path: '',
    component: AnalyticsDashboardComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'workouts',
    component: WorkoutProgressComponent,
    canActivate: [UserSelectedGuard]
  },
  {
    path: '**',
    component: AnalyticsDashboardComponent,
    canActivate: [UserSelectedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
