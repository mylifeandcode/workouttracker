import { Routes } from '@angular/router';
import { UserSelectedGuard } from 'app/core/_guards/user-selected.guard';

export const analyticsroutes: Routes = [
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
  