import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { UserSettings } from 'app/core/models/user-settings';
import { UserService } from 'app/core/user.service';

@Component({
  selector: 'wt-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  constructor(private _authService: AuthService, private _userService: UserService) { }
  public loading: boolean = true;
  public userSettings: UserSettings;

  public ngOnInit(): void {
    //this._userService.getById(this._authService.)
  }

  public recommendationEngineToggled(event: any): void { //TODO: Get or specify a concrete type for the event param

  }

}
