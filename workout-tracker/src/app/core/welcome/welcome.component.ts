import { Component, OnInit, inject } from '@angular/core';
import { UserOverview } from 'app/core/_models/user-overview';
import { UserService } from 'app/core/_services/user/user.service';
import { finalize } from 'rxjs/operators';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'wt-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    imports: [UserOverviewComponent, QuickActionsComponent, ProgressSpinnerModule]
})
export class WelcomeComponent implements OnInit {
  private _userService = inject(UserService);


  public loading: boolean = true;
  public userOverview: UserOverview | undefined;

  public ngOnInit(): void {
    this.getUserOverview();
  }

  private getUserOverview(): void {
    this._userService.getOverview()
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe((userOverview: UserOverview) => {
        this.userOverview = userOverview;
      });
  }

}
