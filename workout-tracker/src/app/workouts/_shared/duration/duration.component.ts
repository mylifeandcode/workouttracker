import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, inject, input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectOnFocusDirective } from '../../../shared/directives/select-on-focus.directive';

interface IDurationForm {
  hours: FormControl<number>;
  minutes: FormControl<number>;
  seconds: FormControl<number>;
}

@Component({
    selector: 'wt-duration',
    templateUrl: './duration.component.html',
    styleUrls: ['./duration.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, SelectOnFocusDirective]
})
export class DurationComponent implements OnChanges {
private _formBuilder = inject(FormBuilder);
;
  readonly currentDuration = input<number>(0);

  @Output()
  okClicked: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  cancelClicked: EventEmitter<void> = new EventEmitter<void>();

  public form: FormGroup<IDurationForm>;

  constructor() { 
    this.form = this.setupFormGroup();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.setFormControlsFromDuration();
  }

  public ok(): void {
    this.okClicked.emit(this.getDurationInSeconds());
  }

  public cancel(): void {
    this.cancelClicked.emit();
  }

  private setupFormGroup(): FormGroup<IDurationForm> {
    return this._formBuilder.group<IDurationForm>({
      hours: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      minutes: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      seconds: new FormControl<number>(0, { nonNullable: true, validators: Validators.required })
    });
  }

  private getDurationInSeconds(): number {
    return this.form.controls.hours.value * 3600
      + this.form.controls.minutes.value * 60
      + this.form.controls.seconds.value;
  }

  private setFormControlsFromDuration(): void {
    if(!this.form)
      this.setupFormGroup();

    const hoursDuration = Math.floor(this.currentDuration() / 3600);
    const remainingSeconds = this.currentDuration() - (hoursDuration * 3600);
    const minutesDuration = Math.floor(remainingSeconds / 60);
    const secondsDuration = this.currentDuration() - (hoursDuration * 3600) - (minutesDuration * 60);

    this.form.patchValue({
      hours: hoursDuration,
      minutes: minutesDuration,
      seconds: secondsDuration
    });
  }
}
