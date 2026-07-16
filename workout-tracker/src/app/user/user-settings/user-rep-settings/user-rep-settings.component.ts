import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { SetType } from '../../../api';
import { SelectOnFocusDirective } from '../../../shared/directives/select-on-focus.directive';


//Data-shaped model for a single rep-settings row, used as part of the Signal Forms model.
//duration is number | null: null = N/A (repetition sets) or an empty timed input; matches the DTO.
export interface IUserRepSettingsModel {
  repSettingsId: number;
  setType: SetType;
  duration: number | null;
  minReps: number;
  maxReps: number;
}

@Component({
    selector: 'wt-user-rep-settings',
    templateUrl: './user-rep-settings.component.html',
    styleUrls: ['./user-rep-settings.component.scss'],
    imports: [FormField, SelectOnFocusDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRepSettingsComponent {

  readonly field = input.required<FieldTree<IUserRepSettingsModel>>();

  public setTypeEnum: typeof SetType = SetType;

  //The row's FieldState (the input's field tree, invoked), as a memoized signal — lets the template
  //read row-level (cross-field) validation errors without calling a getter/method each CD cycle.
  protected readonly rowState = computed(() => this.field()());

}
