import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UserSelectedGuard } from "app/core/guards/user-selected.guard";
import { AnalyticsDashboardComponent } from "./analytics-dashboard/analytics-dashboard.component";

const routes: Routes = [
  {
    path: '',
    component: AnalyticsDashboardComponent,
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
