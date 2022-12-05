import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth.service';
import { User } from 'app/core/models/user';
import { UserMinMaxReps } from 'app/core/models/user-min-max-reps';
import { UserService } from 'app/core/user.service';
import { firstControlValueMustBeLessThanOrEqualToSecond, isRequired } from 'app/validators/custom-validators';
import { catchError, finalize } from 'rxjs/operators';
import { IRepSettingsForm } from '../user-rep-settings/user-rep-settings.component';
import { find } from 'lodash-es';

interface IUserSettingsForm {
  recommendationsEnabled: FormControl<boolean>;
  repSettings: FormArray<FormGroup<IRepSettingsForm>>;
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
  public recommendationsEnabled: boolean = false;

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
        console.log("USER: ", user);
        this.recommendationsEnabled = user.settings.recommendationsEnabled;
        this.createForm();
      });
  }

  public recommendationEngineToggled(event: IToggleEvent): void { //TODO: Get or specify a concrete type for the event param
    this.userSettingsForm.controls.recommendationsEnabled.setValue(event.checked);
    this.recommendationsEnabled = event.checked;
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
      recommendationsEnabled: new FormControl<boolean>(this.user.settings.recommendationsEnabled, { nonNullable: true }),
      repSettings: this.getRepSettingsForm()
    });
  }

  private getRepSettingsForm(): FormArray<FormGroup<IRepSettingsForm>> {
    const formArray = new FormArray<FormGroup<IRepSettingsForm>>([]);
    this.user.settings.repSettings.forEach((value: UserMinMaxReps) => {
      const formGroup: FormGroup<IRepSettingsForm> = this._formBuilder.group<IRepSettingsForm>({
        repSettingsId: new FormControl<number>(value.id, { nonNullable: true}),
        setType: new FormControl<number>(value.setType, { nonNullable: true}),
        duration: new FormControl<number | null>(value.duration, [ Validators.min((value.setType == 1 ? 1 : 0)), isRequired((value.setType == 1)) ]),
        minReps: new FormControl<number>(value.minReps, { nonNullable: true, validators: [ Validators.min(1) ] }),
        maxReps: new FormControl<number>(value.maxReps, { nonNullable: true, validators: [ Validators.min(1) ] })
      }, { validators: [ firstControlValueMustBeLessThanOrEqualToSecond('minReps', 'maxReps') ] });

      formArray.push(formGroup);
    });
    return formArray;
  }

  private updateSettingsForPersist(): void {
    this.user.settings.recommendationsEnabled = this.userSettingsForm.controls.recommendationsEnabled.value;

    //Update rep settings
    this.user.settings.repSettings.forEach((value: UserMinMaxReps) => {
      const formGroup = find(this.userSettingsForm.controls.repSettings.controls, (group: FormGroup<IRepSettingsForm>) => {
        return group.controls.repSettingsId.value == value.id;
      });

      if(!formGroup) { //This should never happen
        window.alert('Error retrieving rep settings values to save. Please contact the system administrator.');
        return;
      }

      value.duration = formGroup.controls.duration.value;
      value.minReps = formGroup.controls.minReps.value;
      value.maxReps = formGroup.controls.maxReps.value;
    });
  }
}
