import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'app/core/auth.service';
import { User } from 'app/core/models/user';
import { UserSettings } from 'app/core/models/user-settings';
import { UserService } from 'app/core/user.service';
import { catchError, finalize } from 'rxjs/operators';

interface IUserSettingsForm {
  recommendationsEnabled: FormControl<boolean>;
}

interface IToggleEvent { //TODO: Determine if PrimeNg has a type for this (probably not)
  originalEvent: any; 
  checked: boolean
}

@Component({
  selector: 'wt-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  public loading: boolean = true;
  public user: User;
  public userSettingsForm: FormGroup<IUserSettingsForm>;
  public saving: boolean = false;

  constructor(
    private _authService: AuthService, 
    private _userService: UserService, 
    private _formBuilder: FormBuilder) { }

  public ngOnInit(): void {
    this._userService.getById(this._authService.userId)
      .pipe(
        finalize(() => { this.loading = false; }),
        catchError((err) => {
          window.alert("ERROR: " + err.message ?? "Unknown error");
          throw err.message;
        })
      )
      .subscribe((user: User) => {
        this.user = user;
        this.createForm();
      });
  }

  public recommendationEngineToggled(event: IToggleEvent): void { //TODO: Get or specify a concrete type for the event param
    this.userSettingsForm.controls.recommendationsEnabled.setValue(event.checked);
  }

  public saveSettings(): void {
    this.updateSettingsForPersist();
    this.saving = true;
    this._userService.update(this.user)
      .pipe(
        finalize(() => { this.saving = false; }),
        catchError((err) => {
          window.alert("ERROR: " + err.message ?? "Unknown error");
          throw err.message;
        })
      )
      .subscribe((user: User) => {
        window.alert("Settings saved.");
      });
  }

  private createForm(): void {
    this.userSettingsForm = this._formBuilder.group<IUserSettingsForm>({
      recommendationsEnabled: new FormControl<boolean>(this.user.settings.recommendationsEnabled, { nonNullable: true })
    });
  }

  private updateSettingsForPersist(): void {
    this.user.settings.recommendationsEnabled = this.userSettingsForm.controls.recommendationsEnabled.value;
  }
}
