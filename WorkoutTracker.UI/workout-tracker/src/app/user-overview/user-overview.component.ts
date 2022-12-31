import { Component, Input, OnInit } from '@angular/core';
import { UserOverview } from 'app/core/models/user-overview';

@Component({
  selector: 'wt-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrls: ['./user-overview.component.scss']
})
export class UserOverviewComponent implements OnInit {

  @Input()
  userOverview: UserOverview;

  @Input()
  public loading: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
