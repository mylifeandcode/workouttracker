import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UserSelectedGuard } from "app/core/guards/user-selected.guard";



const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
    canActivate: [UserSelectedGuard]
  },
  {
    path: 'workouts',
    loadComponent: () => import('./workout-progress/workout-progress.component').then(m => m.WorkoutProgressComponent),
    canActivate: [UserSelectedGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
    canActivate: [UserSelectedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
