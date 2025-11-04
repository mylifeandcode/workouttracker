import { Component, computed, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ExerciseTargetAreaLink } from 'app/workouts/_models/exercise-target-area-link';
import { TargetArea } from 'app/workouts/_models/target-area';
import { effect } from '@angular/core';

@Component({
  selector: 'wt-target-areas',
  imports: [],
  templateUrl: './target-areas.component.html',
  styleUrl: './target-areas.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TargetAreasComponent,
    }
  ]
})
export class TargetAreasComponent implements ControlValueAccessor {

  allTargetAreas = input.required<TargetArea[]>();
  //selectedTargetAreas = model.required<TargetArea[]>();
  exerciseId = input.required<number>();

  onChange = (areaLinks: ExerciseTargetAreaLink[]) => {};
  onTouched = () => {};

  touched: boolean = false;
  disabled: boolean = false;

  selectedAreaIds = computed(() => this._selectedAreas().map(link => link.targetAreaId));

  private _selectedAreas = signal<ExerciseTargetAreaLink[]>([]);

  //ControlValueAccessor methods
  writeValue(areaLinks: ExerciseTargetAreaLink[]): void {
    this._selectedAreas.set(areaLinks);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  //End ControlValueAccessor methods

  toggleTargetArea(targetArea: TargetArea): void {
    if (this._selectedAreas().some(link => link.targetAreaId === targetArea.id)) { 
      this._selectedAreas.update(areas => areas.filter(link => link.targetAreaId !== targetArea.id));
    } else {
      this._selectedAreas.update(areas => [...areas, new ExerciseTargetAreaLink(this.exerciseId(), targetArea.id)]);
    }

    this.onChange(this._selectedAreas());
  }
  
}
