import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { form, FieldTree } from '@angular/forms/signals';
import { WorkoutExerciseComponent } from './workout-exercise.component';
import { Pipe, PipeTransform } from '@angular/core';
import { IWorkoutFormExercise } from '../_interfaces/i-workout-form-exercise';
import { IWorkoutFormExerciseSet } from '../_interfaces/i-workout-form-exercise-set';
import { SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'resistanceType',
})
class ResistanceTypePipeMock implements PipeTransform {
  transform(): string {
    return 'whatever';
  }
}

@Pipe({
  name: 'duration',
})
class DurationPipeMock implements PipeTransform {
  transform(): number {
    return 0;
  }
}

@Pipe({
  name: 'resistanceBandColor',
})
class ResistanceBandColorMock implements PipeTransform {
  transform(): SafeHtml {
    return "<span style='color: red'>Red</span>";
  }
}

@Pipe({
  name: 'exerciseSide',
})
class ExerciseSidePipeMock implements PipeTransform {
  transform(): string {
    return "";
  }
}

@Pipe({
  name: 'resistanceAmount',
})
export class MockResistanceAmountPipe implements PipeTransform {
  transform(): string {
    return 'Fake Resistance Amount';
  }
}

describe('WorkoutExerciseComponent', () => {
  let component: WorkoutExerciseComponent;
  let fixture: ComponentFixture<WorkoutExerciseComponent>;
  let exerciseField: FieldTree<IWorkoutFormExercise>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkoutExerciseComponent,
        ResistanceTypePipeMock,
        DurationPipeMock,
        ResistanceBandColorMock,
        ExerciseSidePipeMock,
        MockResistanceAmountPipe
      ],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutExerciseComponent);
    component = fixture.componentInstance;

    const model = signal<IWorkoutFormExercise>(getExerciseModel());
    exerciseField = TestBed.runInInjectionContext(() => form(model));

    fixture.componentRef.setInput('field', exerciseField);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event when selecting resistance bands', () => {
    vi.spyOn(component.resistanceBandsSelect, 'emit');
    const setField = exerciseField.exerciseSets[0];
    component.selectResistanceBands(setField);
    expect(component.resistanceBandsSelect.emit).toHaveBeenCalledWith(setField);
  });

  it('should emit event to show timer', () => {
    vi.spyOn(component.showTimerRequest, 'emit');
    const setField = exerciseField.exerciseSets[0];
    component.showTimer(setField);
    expect(component.showTimerRequest.emit).toHaveBeenCalledWith(setField);
  });

  it('should emit event when range of motion is changed', () => {
    vi.spyOn(component.rangeOfMotionEntered, 'emit');
    component.rangeOfMotionChanged();
    expect(component.rangeOfMotionEntered.emit).toHaveBeenCalled();
  });

  it('should emit an event to edit duration', () => {
    vi.spyOn(component.durationEdit, 'emit');
    const durationField = exerciseField.exerciseSets[0].duration;
    component.editDuration(durationField);
    expect(component.durationEdit.emit).toHaveBeenCalledWith(durationField);
  });

  it('should apply changes made to first set to remaining sets when user chooses to do so', () => {
    //ARRANGE
    const changedDuration = 999;
    const changedResistance = 1000;
    const changedResistanceMakeup = "Silver";
    const changedTargetReps = 500;

    const sets = exerciseField.exerciseSets;

    //ACT
    sets[0].duration().value.set(changedDuration);
    sets[0].resistance().value.set(changedResistance);
    sets[0].resistanceMakeup().value.set(changedResistanceMakeup);
    sets[0].targetReps().value.set(changedTargetReps);

    component.applySetChangesToAll();

    //ASSERT
    for (let x = 1; x < sets.length; x++) { //Start at index 1, not 0
      expect(sets[x].duration().value()).toBe(changedDuration);
      expect(sets[x].resistance().value()).toBe(changedResistance);
      expect(sets[x].resistanceMakeup().value()).toBe(changedResistanceMakeup);
      expect(sets[x].targetReps().value()).toBe(changedTargetReps);
    }
  });

  function getExerciseModel(): IWorkoutFormExercise {
    const exerciseSets: IWorkoutFormExerciseSet[] = [];

    for (let i = 0; i < 4; i++) {
      exerciseSets.push({
        sequence: i,
        resistance: 160,
        targetReps: 30,
        actualReps: 0,
        formRating: '',
        rangeOfMotionRating: '',
        resistanceMakeup: 'Onyx,Onyx',
        bandsEndToEnd: false,
        duration: 120,
        involvesReps: true,
        side: -1,
        usesBilateralResistance: false
      });
    }

    return {
      id: 10,
      exerciseId: "25",
      exerciseName: 'Chest Press with Bands',
      exerciseSets,
      setType: 0,
      resistanceType: 2
    };
  }
});
