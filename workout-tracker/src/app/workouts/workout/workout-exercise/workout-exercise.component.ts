import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ResistanceType, SetType } from '../../../api';
import { NgStyle } from '@angular/common';
import { IWorkoutFormExercise } from '../_interfaces/i-workout-form-exercise';
import { IWorkoutFormExerciseSet } from '../_interfaces/i-workout-form-exercise-set';
import { SelectOnFocusDirective } from '../../../shared/directives/select-on-focus.directive';
import { ResistanceBandColorPipe } from '../../../shared/pipes/resistance-band-color.pipe';
import { ResistanceTypePipe } from '../../_pipes/resistance-type.pipe';
import { ResistanceAmountPipe } from '../../../workouts/_pipes/resistance-amount.pipe';
import { DurationPipe } from '../../..//workouts/_pipes/duration.pipe';
import { ExerciseSidePipe } from '../../_pipes/exercise-side.pipe';


/**
 * A component representing an Exercise as part of a Workout instance,
 * i.e. "The Chest and Arms Workout on 10/7/2020 includes 5 sets of Diamond Push-Ups with a
 * target rep count of 30 for each set, and an actual rep count of how many I actually did."
 */
@Component({
    selector: 'wt-workout-exercise',
    templateUrl: './workout-exercise.component.html',
    styleUrls: ['./workout-exercise.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormField,
        NgStyle,
        SelectOnFocusDirective,
        ResistanceBandColorPipe,
        ResistanceTypePipe,
        DurationPipe,
        ExerciseSidePipe,
        ResistanceAmountPipe
    ]
})
export class WorkoutExerciseComponent {

  /**
   * The Signal Forms field tree for the Exercise, containing the sub-fields for the Exercise
   * Name, Type, etc, as well as an array of Sets
   */
  readonly field = input.required<FieldTree<IWorkoutFormExercise>>();

  readonly resistanceBandsSelect = output<FieldTree<IWorkoutFormExerciseSet>>();

  readonly showTimerRequest = output<FieldTree<IWorkoutFormExerciseSet>>();

  readonly rangeOfMotionEntered = output();

  readonly durationEdit = output<FieldTree<number>>();

  public setTypeEnum: typeof SetType = SetType;
  public resistanceTypeEnum: typeof ResistanceType = ResistanceType;

  //Properties
  get setsField(): FieldTree<IWorkoutFormExerciseSet[]> { //TODO: Consider refactoring. This is a property, but functionally the same as a method -- not good for using in template expressions!
    //This property provides an easier way for the template to access this information,
    //and is used by the component code as a short-hand reference to the sets field array.
    return this.field().exerciseSets;
  }

  public selectResistanceBands(setField: FieldTree<IWorkoutFormExerciseSet>): void {
    this.resistanceBandsSelect.emit(setField);
  }

  public showTimer(setField: FieldTree<IWorkoutFormExerciseSet>): void {
    this.showTimerRequest.emit(setField);
  }

  public rangeOfMotionChanged(): void {
    this.rangeOfMotionEntered.emit();
  }

  public editDuration(durationField: FieldTree<number>): void {
    this.durationEdit.emit(durationField);
  }

  //This functionality has been moved to the wtSelectOnFocus directive, but I'm leaving this test
  //here so I can remember how to do something like this in the future if I ever need to.
  /*
  public inputFocused(event: Event): void {
    if (event.type != 'focus') {
      return;
    }

    const focusEvent = <FocusEvent>event;
    if (!focusEvent.target) return;
    const target = <HTMLInputElement>focusEvent.target;
    target.select();
  }
  */

  public applySetChangesToAll(): void {
    const sets = this.field().exerciseSets;
    if (sets.length > 1) {
      const source = sets[0]().value();

      for (let x = 1; x < sets.length; x++) {
        sets[x].resistance().value.set(source.resistance);
        sets[x].resistanceMakeup().value.set(source.resistanceMakeup);
        sets[x].duration().value.set(source.duration);
        sets[x].targetReps().value.set(source.targetReps);
      }
    }
  }
}
