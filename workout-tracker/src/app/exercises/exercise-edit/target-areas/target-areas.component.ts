import { Component, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ExerciseTargetAreaLink } from 'app/workouts/_models/exercise-target-area-link';
import { TargetArea } from 'app/workouts/_models/target-area';

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
  selectedTargetAreas = signal<TargetArea[]>([]);

  private _selectedAreas: ExerciseTargetAreaLink[] = [];

  onChange = (areaLinks: ExerciseTargetAreaLink[]) => {};
  onTouched = () => {};

  writeValue(areaLinks: ExerciseTargetAreaLink[]): void {
    this._selectedAreas = areaLinks;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }

  toggleTargetArea(targetArea: TargetArea): void {
    if (this.selectedTargetAreas().includes(targetArea)) { 
      this.selectedTargetAreas.update(areas => areas.filter(a => a !== targetArea));
    } else {
      this.selectedTargetAreas.update(areas => [...areas, targetArea]);
    }
    this.onChange(this.selectedTargetAreas);
  }
  
}
