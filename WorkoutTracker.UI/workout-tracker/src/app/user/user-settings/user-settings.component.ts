import { Component, OnInit } from '@angular/core';
import { UserGoal } from 'app/core/enums/user-goal';

@Component({
  selector: 'wt-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  constructor() { }

  goals = Object.keys(UserGoal); //Needed so we can loop through enum items
  
  ngOnInit(): void {
  }

}
