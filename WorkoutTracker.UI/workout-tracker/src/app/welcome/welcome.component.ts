import { Component, OnInit } from '@angular/core';
import { UserOverview } from 'app/core/models/user-overview';
import { UserService } from 'app/core/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'wt-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  public loading: boolean = true;
  public userOverview: UserOverview;

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
