import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { IExercisePlanFormGroup } from '../interfaces/i-exercise-plan-form-group';

import { ExercisePlanComponent } from './exercise-plan.component';
import { ResistanceTypePipe } from '../pipes/resistance-type.pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ExercisePlanComponent', () => {
  let component: ExercisePlanComponent;
  let fixture: ComponentFixture<ExercisePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ], 
      declarations: [ 
        ExercisePlanComponent,
        ResistanceTypePipe //TODO: Replace with mock 
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExercisePlanComponent);
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
      recommendationReason: new FormControl<string | null>(null),
      usesBilateralResistance: new FormControl<boolean>(false, { nonNullable: true })
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply last resistance values when user chooses to', () => {

    //ARRANGE
    component.formGroup.patchValue({
      resistanceAmountLastTime: 50, 
      resistanceMakeupLastTime: 'Mauve, Tiel', 
      resistanceAmount: 0, 
      resistanceMakeup: ''
    });

    //ACT
    component.useSameResistanceAsLastTime();

    //ASSERT
    expect(component.formGroup.controls.resistanceAmount.value).toBe(50);
    expect(component.formGroup.controls.resistanceMakeup.value).toBe('Mauve, Tiel');

  });

});
