import { Component, OnInit, input } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SetType } from 'app/workouts/workout/_enums/set-type';
import { SelectOnFocusDirective } from '../../shared/directives/select-on-focus.directive';

export interface IRepSettingsForm {
  repSettingsId: FormControl<number>;
  setType: FormControl<number>;
  duration: FormControl<number | null>;
  minReps: FormControl<number>;
  maxReps: FormControl<number>;
}

@Component({
    selector: 'wt-user-rep-settings',
    templateUrl: './user-rep-settings.component.html',
    styleUrls: ['./user-rep-settings.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, SelectOnFocusDirective]
})
export class UserRepSettingsComponent implements OnInit {

  readonly repSettingsFormGroup = input.required<FormGroup<IRepSettingsForm>>(); //WARN: use of ! -- look for a better solution

  public setTypeEnum: typeof SetType = SetType;

  constructor() { }

  ngOnInit(): void {
  }

}
