import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'wt-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminHomeComponent {

}
