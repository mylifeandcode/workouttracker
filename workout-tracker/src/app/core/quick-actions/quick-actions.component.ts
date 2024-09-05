import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'wt-quick-actions',
    templateUrl: './quick-actions.component.html',
    styleUrls: ['./quick-actions.component.scss'],
    standalone: true,
    imports: [RouterLink]
})
export class QuickActionsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
