import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { User } from 'app/core/_models/user';
import { UserMinMaxReps } from 'app/core/_models/user-min-max-reps';
import { UserService } from 'app/core/_services/user/user.service';
import { firstControlValueMustBeLessThanOrEqualToSecond, isRequired } from 'app/core/_validators/custom-validators';
import { catchError, finalize } from 'rxjs/operators';
import { IRepSettingsForm, UserRepSettingsComponent } from '../user-rep-settings/user-rep-settings.component';
import { find } from 'lodash-es';
import { CheckForUnsavedDataComponent } from 'app/shared/components/check-for-unsaved-data.component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface IUserSettingsForm {
  recommendationsEnabled: FormControl<boolean>;
  repSettings?: FormArray<FormGroup<IRepSettingsForm>>;
}

@Component({
  selector: 'wt-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzSwitchModule,
    UserRepSettingsComponent,
    RouterLink
  ]
})
export class UserSettingsComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _formBuilder = inject(FormBuilder);
  private _messageService = inject(NzMessageService);

  public loading: boolean = true;
  public user: User | undefined; //Undefined until retrieved from service
  public userSettingsForm: FormGroup<IUserSettingsForm> | undefined; //undefined until user info is retrieved
  public saving: boolean = false;

  public ngOnInit(): void {
    if (!this._authService.userPublicId) return;
    this._userService.getById(this._authService.userPublicId)
      .pipe(
        finalize(() => { this.loading = false; }),
        catchError((err) => {
          window.alert("ERROR: " + err.message);
          throw err.message;
        })
      )
      .subscribe((user: User) => {
        this.user = user;
        this.createForm();
      });
  }

  public recommendationEngineToggled(): void {
    //TODO: Re-evaluate. May be better to just subscribe to the valueChanges Observable and use that to trigger this method.
    if (this.userSettingsForm?.controls.recommendationsEnabled.value == true) {
      if (this.user) {
        if (this.user.settings.repSettings == null || this.user.settings.repSettings.length === 0) {
          this.user.settings.repSettings = []; // Ensure it's an empty array if null or undefined
          this.user.settings.repSettings.push(...[new UserMinMaxReps(), new UserMinMaxReps()]); // Add at least one default entry
          this.user.settings.repSettings[0].setType = 0; // Default to Repetition for the first entry
          this.user.settings.repSettings[1].setType = 1; // Default to Timed for the second entry
        }
      }
      this.userSettingsForm.controls.repSettings = this.getRepSettingsForm();
    }
    else {
      //this.userSettingsForm!.removeControl('repSettings'); // Remove the repSettings control if recommendations are disabled
      this.userSettingsForm?.removeControl('repSettings');
    }
  }

  public saveSettings(): void {
    if (!this.user) return;

    this.updateSettingsForPersist();
    this.saving = true;
    this._userService.update(this.user)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.userSettingsForm?.markAsPristine();
        }),
        catchError((err) => {
          window.alert("ERROR: " + err.message);
          throw err.message;
        })
      )
      .subscribe((user: User) => {
        this._messageService.success('Settings saved.');
      });
  }

  public hasUnsavedData(): boolean {
    if (!this.userSettingsForm) return false;
    return this.userSettingsForm.dirty;
  }

  private createForm(): void {
    if (!this.user) return;
    this.userSettingsForm = this._formBuilder.group<IUserSettingsForm>({
      recommendationsEnabled: new FormControl<boolean>(this.user.settings.recommendationsEnabled, { nonNullable: true }),
      repSettings: this.getRepSettingsForm()
    });
  }

  private getRepSettingsForm(): FormArray<FormGroup<IRepSettingsForm>> {
    const formArray = new FormArray<FormGroup<IRepSettingsForm>>([]);
    if (this.user) {
      this.user.settings.repSettings.forEach((value: UserMinMaxReps) => {
        const formGroup: FormGroup<IRepSettingsForm> = this._formBuilder.group<IRepSettingsForm>({
          repSettingsId: new FormControl<number>(value.id, { nonNullable: true }),
          setType: new FormControl<number>(value.setType, { nonNullable: true }),
          duration: new FormControl<number | null>(value.duration, [Validators.min((value.setType == 1 ? 1 : 0)), isRequired((value.setType == 1))]),
          minReps: new FormControl<number>(value.minReps, { nonNullable: true, validators: [Validators.min(1), isRequired(true)] }),
          maxReps: new FormControl<number>(value.maxReps, { nonNullable: true, validators: [Validators.min(1)] })
        }, { validators: [firstControlValueMustBeLessThanOrEqualToSecond('minReps', 'maxReps')] });

        formArray.push(formGroup);
      });
    }
    return formArray;
  }

  private updateSettingsForPersist(): void {
    if (!this.user) return;
    if (!this.userSettingsForm) return;

    this.user.settings.recommendationsEnabled = this.userSettingsForm.controls.recommendationsEnabled.value;

    //Update rep settings

    this.user.settings.repSettings.forEach((value: UserMinMaxReps) => {
      if (this.userSettingsForm !== undefined) { //Needed to keep the linter happy, despite the above check
        const formGroup = find(this.userSettingsForm.controls.repSettings?.controls, (group: FormGroup<IRepSettingsForm>) =>
          group.controls.repSettingsId.value == value.id
        );

        if (!formGroup) { //This should never happen
          window.alert('Error retrieving rep settings values to save. Please contact the system administrator.');
          return;
        }

        value.duration = formGroup.controls.duration.value;
        value.minReps = formGroup.controls.minReps.value;
        value.maxReps = formGroup.controls.maxReps.value;
      }
    });
  }
}
