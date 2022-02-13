import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkoutExerciseComponent } from './workout-exercise.component';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExecutedExercise } from '../models/executed-exercise';
import { Exercise } from '../models/exercise';
import * as _ from 'lodash';
import { compileComponentFromMetadata } from '@angular/compiler';

describe('WorkoutExerciseComponent', () => {
  let component: WorkoutExerciseComponent;
  let fixture: ComponentFixture<WorkoutExerciseComponent>;
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ], 
      declarations: [ WorkoutExerciseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutExerciseComponent);
    component = fixture.componentInstance;
    formBuilder = new FormBuilder();
    component.formGroup = formBuilder.group({
      id: [0, Validators.required ],
      workoutDefinitions: [''], //https://coryrylan.com/blog/creating-a-dynamic-select-with-angular-forms
      exercises: formBuilder.array([])
    });
    setupExercisesFormGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function setupExercisesFormGroup(): void {

    let exercises = new Array<ExecutedExercise>();
    const formBuilder = new FormBuilder();
    component.formGroup.addControl('exerciseSets', formBuilder.array([]));

    //TODO: Create a builder for this
    exercises.push(<ExecutedExercise>{ 
      sequence: 0, 
      setType: 1, 
      exercise: <Exercise>{ id: 1 } 
    });

    component.formGroup = 
      formBuilder.group({
        id: exercises[0].id, //WARN: Pretty sure this will still just be 0 at this point
        exerciseId: exercises[0].exercise.id, 
        exerciseName: [exercises[0].exercise.name, Validators.compose([Validators.required])],
        exerciseSets: getExerciseSetsFormArray(exercises, formBuilder), 
        setType: [exercises[0].setType, Validators.compose([Validators.required])], 
        resistanceType: [exercises[0].exercise.resistanceType, Validators.compose([Validators.required])]
      });

  }

  function getExerciseSetsFormArray(
    exercises: ExecutedExercise[], 
    formBuilder: FormBuilder): FormArray {

    let formArray = formBuilder.array([]);

    //Each member of the array is a FormGroup
    for(let i = 0; i < exercises.length; i++) {
      let formGroup = formBuilder.group({
        sequence: [exercises[i].sequence], 
        resistance: [exercises[i].resistanceAmount, Validators.required], 
        targetReps: [exercises[i].targetRepCount, Validators.required], //TODO: Populate with data from API once refactored to provide it!
        actualReps: [0, Validators.required], 
        formRating: [null, Validators.required], 
        rangeOfMotionRating: [null, Validators.required], 
        resistanceMakeup: [exercises[i].resistanceMakeup], 
        bandsEndToEnd: [exercises[i].exercise.bandsEndToEnd], //TODO: This is kind of a hack, as this value is at the exercise, not set level, and is therefore duplicated here
        duration: [120] //TODO: Get/set value from API
      });

      formArray.push(formGroup);
    }

    return formArray;
  }
});
