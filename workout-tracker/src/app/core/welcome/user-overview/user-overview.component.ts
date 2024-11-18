import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UserOverview } from 'app/core/_models/user-overview';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'wt-user-overview',
    templateUrl: './user-overview.component.html',
    styleUrls: ['./user-overview.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DatePipe]
})
export class UserOverviewComponent {

  @Input()
  userOverview: UserOverview | undefined;

  //Replaced with @defer where this component is used :)
  /*
  @Input()
  public loading: boolean = true;
  */

  constructor() { }

}
