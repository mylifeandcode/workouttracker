import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'wt-duration',
  templateUrl: './duration.component.html',
  styleUrls: ['./duration.component.css']
})
export class DurationComponent implements OnInit, OnChanges {;
  @Input()
  currentDuration: number;

  @Output()
  okClicked: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  cancelClicked: EventEmitter<void> = new EventEmitter<void>();

  public form: UntypedFormGroup;

  constructor(private _formBuilder: UntypedFormBuilder) { }

  public ngOnInit(): void {
    this.setupFormGroup();
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

  private setupFormGroup(): void {
    if(!this.form) {

      this.form = this._formBuilder.group({
        hours: [0, Validators.required],
        minutes: [0, Validators.required],
        seconds: [0, Validators.required]
      });

    }
  }

  private getDurationInSeconds(): number {
    return this.form.controls.hours.value * 3600
      + this.form.controls.minutes.value * 60
      + this.form.controls.seconds.value;
  }

  private setFormControlsFromDuration(): void {
    if(!this.form)
      this.setupFormGroup();

    const hoursDuration = Math.floor(this.currentDuration / 3600);
    const remainingSeconds = this.currentDuration - (hoursDuration * 3600);
    const minutesDuration = Math.floor(remainingSeconds / 60);
    const secondsDuration = this.currentDuration - (hoursDuration * 3600) - (minutesDuration * 60);

    this.form.patchValue({
      hours: hoursDuration,
      minutes: minutesDuration,
      seconds: secondsDuration
    });
  }
}
