import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkoutExerciseComponent } from './workout-exercise.component';
import { UntypedFormArray, UntypedFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExecutedExerciseDTO } from '../models/executed-exercise-dto';
import { Exercise } from '../models/exercise';
import { Pipe } from '@angular/core';
import { ResistanceType } from '../enums/resistance-type';

@Pipe({
  name: 'resistanceType'
})
class ResistanceTypePipeMock {
  transform(value: ResistanceType, capitalizeEachWord: boolean = true): string {
    return 'whatever';
  }
}

@Pipe({
  name: 'duration'
})
class DurationPipeMock {
  transform(value: number, precise: boolean = false): number {
    return 0;
  }
}

describe('WorkoutExerciseComponent', () => {
  let component: WorkoutExerciseComponent;
  let fixture: ComponentFixture<WorkoutExerciseComponent>;
  let formBuilder: UntypedFormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ], 
      declarations: [ 
        WorkoutExerciseComponent, 
        ResistanceTypePipeMock,
        DurationPipeMock 
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutExerciseComponent);
    component = fixture.componentInstance;
    formBuilder = new UntypedFormBuilder();
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

  it('should emit event when selecting resistance bands', () => {
    spyOn(component.resistanceBandsSelect, 'emit');
    component.selectResistanceBands(component.setsArray.controls[0]);
    expect(component.resistanceBandsSelect.emit).toHaveBeenCalledWith(component.setsArray.controls[0]);
  });

  it('should emit event to show timer', () => {
    spyOn(component.showTimerRequest, 'emit');
    component.showTimer(component.setsArray.controls[0]);
    expect(component.showTimerRequest.emit).toHaveBeenCalledWith(component.setsArray.controls[0]);
  });

  it('should emit event when range of motion is changed', () => {
    spyOn(component.rangeOfMotionEntered, 'emit');
    component.rangeOfMotionChanged();
    expect(component.rangeOfMotionEntered.emit).toHaveBeenCalled();
  });

  it('should emit an event to edit duration', () => {
    spyOn(component.durationEdit, 'emit');
    component.editDuration(component.setsArray.controls[0].controls.duration);
    expect(component.durationEdit.emit).toHaveBeenCalledWith(component.setsArray.controls[0].controls.duration);
  });

  function setupExercisesFormGroup(): void {

    let exercises = new Array<ExecutedExerciseDTO>();
    const formBuilder = new UntypedFormBuilder();
    component.formGroup.addControl('exerciseSets', formBuilder.array([]));

    //TODO: Create a builder for this
    exercises.push(<ExecutedExerciseDTO>{ 
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
    exercises: ExecutedExerciseDTO[], 
    formBuilder: UntypedFormBuilder): UntypedFormArray {

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
