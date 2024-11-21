import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'wt-admin-home',
    templateUrl: './admin-home.component.html',
    styleUrls: ['./admin-home.component.scss'],
    imports: [RouterLink]
})
export class AdminHomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
