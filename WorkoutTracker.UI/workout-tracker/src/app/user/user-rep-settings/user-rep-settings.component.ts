import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

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
  styleUrls: ['./user-rep-settings.component.css']
})
export class UserRepSettingsComponent implements OnInit {

  @Input()
  repSettingsFormGroup: FormGroup<IRepSettingsForm>;

  constructor() { }

  ngOnInit(): void {
  }

}
