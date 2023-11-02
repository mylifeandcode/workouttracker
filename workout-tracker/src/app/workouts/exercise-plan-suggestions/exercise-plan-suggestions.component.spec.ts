import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePlanSuggestionsComponent } from './exercise-plan-suggestions.component';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'resistanceAmount'
})
export class MockResistanceAmountPipe implements PipeTransform {
  transform(value: number | null): string {
    return 'Fake Resistance Amount';
  }
}

describe('ExercisePlanSuggestionsComponent', () => {
  let component: ExercisePlanSuggestionsComponent;
  let fixture: ComponentFixture<ExercisePlanSuggestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExercisePlanSuggestionsComponent,
        MockResistanceAmountPipe
      ]
    });
    fixture = TestBed.createComponent(ExercisePlanSuggestionsComponent);
    component = fixture.componentInstance;

    const formBuilder = new FormBuilder();
    component.formGroup = formBuilder.group<IExercisePlanFormGroup>({
      exerciseInWorkoutId: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }), 
      exerciseId: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }), 
      exerciseName: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      numberOfSets: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      setType: new FormControl<number>(1, { nonNullable: true, validators: Validators.required }),
      resistanceType: new FormControl<number>(1, { nonNullable: true, validators: Validators.required }),
      sequence: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      targetRepCountLastTime: new FormControl<number | null>(0), 
      avgActualRepCountLastTime: new FormControl<number | null>(0),
      avgRangeOfMotionLastTime: new FormControl<number | null>(0), 
      avgFormLastTime: new FormControl<number | null>(0), 
      recommendedTargetRepCount: new FormControl<number | null>(0), 
      targetRepCount: new FormControl<number | null>(0, { validators: Validators.min(1) }),
      resistanceAmountLastTime: new FormControl<number | null>(0), 
      resistanceMakeupLastTime: new FormControl<string | null>(null), 
      recommendedResistanceAmount: new FormControl<number | null>(0),
      recommendedResistanceMakeup: new FormControl<string | null>(null), 
      resistanceAmount: new FormControl<number>(0, { nonNullable: true, validators: (Validators.min(0.1))} ), 
      resistanceMakeup: new FormControl<string | null>(null), 
      bandsEndToEnd: new FormControl<boolean | null>(null), 
      involvesReps: new FormControl<boolean>(true, { nonNullable: true }),
      recommendationReason: new FormControl<string | null>(null)
    });

    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply suggestion values when user chooses to', () => {

    //ARRANGE
    component.formGroup.patchValue({
      resistanceAmountLastTime: 50, 
      resistanceMakeupLastTime: 'Mauve, Tiel', 
      resistanceAmount: 0, 
      resistanceMakeup: '', 
      recommendedResistanceAmount: 60, 
      recommendedResistanceMakeup: 'Aqua', 
      recommendedTargetRepCount: 8
    });

    //ACT
    component.useSuggestions();

    //ASSERT
    expect(component.formGroup.controls.resistanceAmount.value).toBe(60);
    expect(component.formGroup.controls.resistanceMakeup.value).toBe('Aqua');
    expect(component.formGroup.controls.recommendedTargetRepCount.value).toBe(8);

  });
  
});
