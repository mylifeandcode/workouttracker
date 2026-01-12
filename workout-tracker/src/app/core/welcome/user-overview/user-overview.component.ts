import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UserOverview } from '../../../core/_models/user-overview';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'wt-user-overview',
    templateUrl: './user-overview.component.html',
    styleUrls: ['./user-overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DatePipe]
})
export class UserOverviewComponent {
  readonly userOverview = input<UserOverview>();
}
