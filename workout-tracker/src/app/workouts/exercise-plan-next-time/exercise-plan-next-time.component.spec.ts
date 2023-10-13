import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePlanNextTimeComponent } from './exercise-plan-next-time.component';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';

describe('ExercisePlanNextTimeComponent', () => {
  let component: ExercisePlanNextTimeComponent;
  let fixture: ComponentFixture<ExercisePlanNextTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExercisePlanNextTimeComponent]
    });
    fixture = TestBed.createComponent(ExercisePlanNextTimeComponent);
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
});
