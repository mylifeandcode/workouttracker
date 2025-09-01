import { Component, OnInit, inject, signal } from '@angular/core';
import { UserOverview } from 'app/core/_models/user-overview';
import { UserService } from 'app/core/_services/user/user.service';
import { finalize } from 'rxjs/operators';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { StartWorkoutComponent } from './start-workout/start-workout.component';

@Component({
    selector: 'wt-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    imports: [UserOverviewComponent, QuickActionsComponent, StartWorkoutComponent, NzSpinModule]
})
export class WelcomeComponent implements OnInit {
  private _userService = inject(UserService);


  public loading = signal<boolean>(true);
  public userOverview = signal<UserOverview | undefined>(undefined);

  public ngOnInit(): void {
    this.getUserOverview();
  }

  private getUserOverview(): void {
    this._userService.getOverview()
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe((userOverview: UserOverview) => {
        this.userOverview.set(userOverview);
      });
  }

}
