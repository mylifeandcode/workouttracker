import { Component, OnInit } from '@angular/core';
import { UserOverview } from 'app/core/models/user-overview';
import { UserService } from 'app/core/services/user/user.service';
import { finalize } from 'rxjs/operators';
import { UserOverviewComponent } from '../user-overview/user-overview.component';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';

@Component({
    selector: 'wt-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    standalone: true,
    imports: [UserOverviewComponent, QuickActionsComponent]
})
export class WelcomeComponent implements OnInit {

  public loading: boolean = true;
  public userOverview: UserOverview | undefined; //Undefined until retrieved from service

  constructor(private _userService: UserService) { }

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
