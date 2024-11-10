import { Component, OnInit } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';

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
    styleUrls: ['./user-settings.component.scss'],
    standalone: true,
    imports: [
      FormsModule, 
      ReactiveFormsModule, 
      InputSwitchModule, 
      UserRepSettingsComponent, 
      RouterLink, 
      ToastModule
    ],
    //providers: [MessageService]
})
export class UserSettingsComponent extends CheckForUnsavedDataComponent implements OnInit {

  public loading: boolean = true;
  public user: User | undefined; //Undefined until retrieved from service
  public userSettingsForm: FormGroup<IUserSettingsForm> | undefined; //undefined until user info is retrieved
  public saving: boolean = false;
  public recommendationEngineEnabled: boolean = false;

  constructor(
    private _authService: AuthService, 
    private _userService: UserService, 
    private _formBuilder: FormBuilder,
    private _messageService: MessageService) { 
      
      super();

  }

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
        this.recommendationEngineEnabled = user.settings.recommendationsEnabled;
        this.createForm();
      });
  }

  public recommendationEngineToggled(event: IToggleEvent): void { //TODO: Get or specify a concrete type for the event param
    this.userSettingsForm?.controls.recommendationsEnabled.setValue(event.checked);
    this.recommendationEngineEnabled = event.checked;
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
        this._messageService.add({severity:'success', summary: 'Successful', detail: 'Settings saved.', life: 3000});
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
          repSettingsId: new FormControl<number>(value.id, { nonNullable: true}),
          setType: new FormControl<number>(value.setType, { nonNullable: true}),
          duration: new FormControl<number | null>(value.duration, [ Validators.min((value.setType == 1 ? 1 : 0)), isRequired((value.setType == 1)) ]),
          minReps: new FormControl<number>(value.minReps, { nonNullable: true, validators: [ Validators.min(1), isRequired(true) ] }),
          maxReps: new FormControl<number>(value.maxReps, { nonNullable: true, validators: [ Validators.min(1) ] })
        }, { validators: [ firstControlValueMustBeLessThanOrEqualToSecond('minReps', 'maxReps') ] });

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
      if(this.userSettingsForm !== undefined) { //Needed to keep the linter happy, despite the above check
        const formGroup = find(this.userSettingsForm.controls.repSettings.controls, (group: FormGroup<IRepSettingsForm>) => 
          group.controls.repSettingsId.value == value.id
        );

        if(!formGroup) { //This should never happen
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
