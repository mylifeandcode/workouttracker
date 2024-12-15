import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkoutExerciseComponent } from './workout-exercise.component';
import { ReactiveFormsModule, Validators, FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ExecutedExerciseDTO } from '../../_models/executed-exercise-dto';
import { Pipe, PipeTransform } from '@angular/core';
import { ResistanceType } from '../_enums/resistance-type';
import { IWorkoutFormExercise } from '../_interfaces/i-workout-form-exercise';
import { IWorkoutFormExerciseSet } from '../_interfaces/i-workout-form-exercise-set';
import { SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'resistanceType',
    standalone: true
})
class ResistanceTypePipeMock implements PipeTransform {
  transform(value: ResistanceType, capitalizeEachWord: boolean = true): string {
    return 'whatever';
  }
}

@Pipe({
    name: 'duration',
    standalone: true
})
class DurationPipeMock implements PipeTransform {
  transform(value: number, precise: boolean = false): number {
    return 0;
  }
}

@Pipe({
    name: 'resistanceBandColor',
    standalone: true
})
class ResistanceBandColorMock implements PipeTransform {
  transform(value: string | null): SafeHtml {
    return "<span style='color: red'>Red</span>";
  }
}

@Pipe({
    name: 'exerciseSide',
    standalone: true
})
class ExerciseSidePipeMock implements PipeTransform {
  transform(value: number | null): string {
    return "";
  }
}

@Pipe({
    name: 'resistanceAmount',
    standalone: true
})
export class MockResistanceAmountPipe implements PipeTransform {
  transform(value: number | null): string {
    return 'Fake Resistance Amount';
  }
}

describe('WorkoutExerciseComponent', () => {
  let component: WorkoutExerciseComponent;
  let fixture: ComponentFixture<WorkoutExerciseComponent>;
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, WorkoutExerciseComponent,
        ResistanceTypePipeMock,
        DurationPipeMock,
        ResistanceBandColorMock,
        ExerciseSidePipeMock,
        MockResistanceAmountPipe]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutExerciseComponent);
    component = fixture.componentInstance;

    const exerciseArray: ExecutedExerciseDTO[] = getExercises();

    formBuilder = new FormBuilder();
    fixture.componentRef.setInput('formGroup', formBuilder.group<IWorkoutFormExercise>({
      id: new FormControl<number>(10, { nonNullable: true }),
      exerciseId: new FormControl<number>(25, { nonNullable: true }), 
      exerciseName: new FormControl<string>('Chest Press with Bands', { nonNullable: true }),
      exerciseSets: getExerciseSetsFormArray(exerciseArray), 
      setType: new FormControl<number>(exerciseArray[0].setType, { nonNullable: true }), 
      resistanceType: new FormControl<number>(exerciseArray[0].resistanceType, { nonNullable: true })
    }));
    //setupExercisesFormGroup();
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

  //This functionality has been moved to the wtSelectOnFocus directive, but I'm leaving this test 
  //here so I can remember how to do something like this in the future if I ever need to.
  /*
  it('should select the contents of an input when an input gets focus', () => {
    //ARRANGE
    //const element = new HTMLInputElement();
    const element = fixture.nativeElement.querySelector("input[type=number]");
    spyOn(element, 'select');
    
    //ACT
    element.dispatchEvent(new Event('focus'));

    //ASSERT
    expect(element.select).toHaveBeenCalled();
  });
  */

  it('should apply changes made to first set to remaining sets when user chooses to do so', () => {
    //ARRANGE
    const changedDuration = 999;
    const changedResistance = 1000;
    const changedResistanceMakeup = "Silver";
    const changedTargetReps = 500;

    //ACT
    component.formGroup().controls.exerciseSets.controls[0].patchValue(
      {
        duration: changedDuration,
        resistance: changedResistance,
        resistanceMakeup: changedResistanceMakeup,
        targetReps: changedTargetReps
      }
    );

    component.applySetChangesToAll();

    //ASSERT
    const arrayCount = component.formGroup().controls.exerciseSets.controls.length;
    for(let x = 1; x < arrayCount; x++) { //Start at index 1, not 0
      expect(component.formGroup().controls.exerciseSets.controls[x].controls.duration.value).toBe(changedDuration);
      expect(component.formGroup().controls.exerciseSets.controls[x].controls.resistance.value).toBe(changedResistance);
      expect(component.formGroup().controls.exerciseSets.controls[x].controls.resistanceMakeup.value).toBe(changedResistanceMakeup);
      expect(component.formGroup().controls.exerciseSets.controls[x].controls.targetReps.value).toBe(changedTargetReps);
    }
  });

  function getExerciseSetsFormArray(exercises: ExecutedExerciseDTO[]): FormArray<FormGroup<IWorkoutFormExerciseSet>> {

    const formArray = new FormArray<FormGroup<IWorkoutFormExerciseSet>>([]);

    //Each member of the array is a FormGroup
    for(let i = 0; i < exercises.length; i++) {
      const formGroup = formBuilder.group<IWorkoutFormExerciseSet>({
        sequence: new FormControl<number>(exercises[i].sequence, { nonNullable: true }), 
        resistance: new FormControl<number>(exercises[i].resistanceAmount, { nonNullable: true, validators: Validators.required }),
        targetReps: new FormControl<number>(exercises[i].targetRepCount, { nonNullable: true, validators: Validators.required }), 
        actualReps: new FormControl<number>(exercises[i].actualRepCount ? exercises[i].actualRepCount : 0, { nonNullable: true, validators: Validators.required }),
        formRating: new FormControl<number | null>(exercises[i].formRating ? exercises[i].formRating : null, { validators: Validators.required }),
        rangeOfMotionRating: new FormControl<number | null>(exercises[i].rangeOfMotionRating ? exercises[i].rangeOfMotionRating : null, { validators: Validators.required }),
        resistanceMakeup: new FormControl<string | null>(exercises[i].resistanceMakeup), 
        bandsEndToEnd: new FormControl<boolean | null>(exercises[i].bandsEndToEnd), 
        duration: new FormControl<number | null>(120), 
        involvesReps: new FormControl<boolean>(exercises[i].involvesReps, { nonNullable: true }),
        side: new FormControl<number | null>(null),
        usesBilateralResistance: new FormControl<boolean>(false, { nonNullable: true})
      });

      formArray.push(formGroup);
    }

    return formArray;
  }

  function getExercises(): ExecutedExerciseDTO[] {
    const exercises: ExecutedExerciseDTO[] = [];

    for(let i = 0; i < 4; i++) {
      const exercise = new ExecutedExerciseDTO();
      exercise.actualRepCount = 0;
      exercise.bandsEndToEnd = false;
      exercise.duration = 60;
      exercise.exerciseId = 100;
      exercise.formRating = 0;
      exercise.id = 5;
      exercise.involvesReps = true;
      exercise.name = 'Chest Press w/Bands';
      exercise.rangeOfMotionRating = 0;
      exercise.resistanceAmount = 160;
      exercise.resistanceMakeup = 'Onyx,Onyx';
      exercise.resistanceType = 2;
      exercise.sequence = i;
      exercise.targetRepCount = 30;
      exercise.setType = 0;

      exercises.push(exercise);
    }

    return exercises;
  }
});
