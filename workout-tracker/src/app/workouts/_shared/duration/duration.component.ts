import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, required, min, max } from '@angular/forms/signals';
import { SelectOnFocusDirective } from '../../../shared/directives/select-on-focus.directive';

interface IDurationModel {
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
    selector: 'wt-duration',
    templateUrl: './duration.component.html',
    styleUrls: ['./duration.component.scss'],
    imports: [FormField, SelectOnFocusDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DurationComponent {

  readonly currentDuration = input<number>(0);
  readonly okClicked = output<number>();
  readonly cancelClicked = output<void>();

  //Model is derived from the currentDuration input but user-editable: linkedSignal recomputes
  //(resetting the fields) whenever currentDuration changes, replacing the old ngOnChanges patch.
  protected readonly model = linkedSignal<IDurationModel>(() => this.splitSeconds(this.currentDuration()));

  public readonly form = form(this.model, (p) => {
    required(p.hours);
    min(p.hours, 0);
    required(p.minutes);
    min(p.minutes, 0);
    max(p.minutes, 59);
    required(p.seconds);
    min(p.seconds, 0);
    max(p.seconds, 59);
  });

  public ok(): void {
    this.okClicked.emit(this.getDurationInSeconds());
  }

  public cancel(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.cancelClicked.emit();
  }

  private splitSeconds(totalSeconds: number): IDurationModel {
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds - (hours * 3600);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = totalSeconds - (hours * 3600) - (minutes * 60);

    return { hours, minutes, seconds };
  }

  private getDurationInSeconds(): number {
    const m = this.model();
    return m.hours * 3600 + m.minutes * 60 + m.seconds;
  }
}
