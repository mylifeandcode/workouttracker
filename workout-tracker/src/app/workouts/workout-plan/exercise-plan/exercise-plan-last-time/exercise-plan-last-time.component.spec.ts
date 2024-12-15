import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePlanLastTimeComponent } from './exercise-plan-last-time.component';
import { RatingPipe } from '../../../_pipes/rating.pipe';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'resistanceAmount',
    standalone: true
})
export class MockResistanceAmountPipe implements PipeTransform {
  transform(value: number | null): string {
    return 'Fake Resistance Amount';
  }
}

describe('ExercisePlanLastTimeComponent', () => {
  let component: ExercisePlanLastTimeComponent;
  let fixture: ComponentFixture<ExercisePlanLastTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ExercisePlanLastTimeComponent,
        RatingPipe, //TODO: Replace with mock
        MockResistanceAmountPipe],
    providers: [
        FormBuilder
    ]
});
    fixture = TestBed.createComponent(ExercisePlanLastTimeComponent);
    component = fixture.componentInstance;
    createFormGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function createFormGroup(): void {
    const formBuilder = TestBed.inject(FormBuilder);
    fixture.componentRef.setInput('formGroup', formBuilder.group<IExercisePlanFormGroup>({
      exerciseInWorkoutId: new FormControl<number>(1, { nonNullable: true, validators: Validators.required }), 
      exerciseId: new FormControl<number>(200, { nonNullable: true, validators: Validators.required }), 
      exerciseName: new FormControl<string>('Bench Press', { nonNullable: true, validators: Validators.required }),
      numberOfSets: new FormControl<number>(3, { nonNullable: true, validators: Validators.required }),
      setType: new FormControl<number>(1, { nonNullable: true, validators: Validators.required }),
      resistanceType: new FormControl<number>(2, { nonNullable: true, validators: Validators.required }),
      sequence: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      targetRepCountLastTime: new FormControl<number | null>(null), 
      avgActualRepCountLastTime: new FormControl<number | null>(null),
      avgRangeOfMotionLastTime: new FormControl<number | null>(null), 
      avgFormLastTime: new FormControl<number | null>(null), 
      recommendedTargetRepCount: new FormControl<number | null>(null), 
      targetRepCount: new FormControl<number | null>(null, { validators: Validators.min(1) }),
      resistanceAmountLastTime: new FormControl<number | null>(null), 
      resistanceMakeupLastTime: new FormControl<string | null>(null), 
      recommendedResistanceAmount: new FormControl<number | null>(null),
      recommendedResistanceMakeup: new FormControl<string | null>(null), 
      resistanceAmount: new FormControl<number>(100, { nonNullable: true, validators: Validators.min(0.1)} ), 
      resistanceMakeup: new FormControl<string | null>(null), 
      bandsEndToEnd: new FormControl<boolean | null>(null), 
      involvesReps: new FormControl<boolean>(true, { nonNullable: true }),
      recommendationReason: new FormControl<string | null>(null),
      usesBilateralResistance: new FormControl<boolean>(false, { nonNullable: true })
    }));
  }
});
