import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'wt-quick-actions',
    templateUrl: './quick-actions.component.html',
    styleUrls: ['./quick-actions.component.scss'],
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickActionsComponent {
}
