import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SetType } from '../_enums/set-type';
import { ResistanceType } from '../_enums/resistance-type';
import { NgStyle } from '@angular/common';
import { IWorkoutFormExercise } from '../_interfaces/i-workout-form-exercise';
import { IWorkoutFormExerciseSet } from '../_interfaces/i-workout-form-exercise-set';
import { SelectOnFocusDirective } from '../../../shared/directives/select-on-focus.directive';
import { ResistanceBandColorPipe } from '../../../shared/pipes/resistance-band-color.pipe';
import { ResistanceTypePipe } from '../../_pipes/resistance-type.pipe';
import { ResistanceAmountPipe } from 'app/workouts/_pipes/resistance-amount.pipe';
import { DurationPipe } from 'app/workouts/_pipes/duration.pipe';
import { ExerciseSidePipe } from 'app/workouts/_pipes/exercise-side.pipe';

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
        FormsModule,
        ReactiveFormsModule,
        NgStyle,
        SelectOnFocusDirective,
        ResistanceBandColorPipe,
        ResistanceTypePipe,
        DurationPipe,
        ExerciseSidePipe,
        ResistanceAmountPipe
    ]
})
export class WorkoutExerciseComponent implements OnInit {

  /**
   * The FormGroup containing FormControls for the Exercise Name, Type, etc, as well as
   * a FormArray for the Sets
   */
  @Input({ required: true })
  formGroup: FormGroup<IWorkoutFormExercise> = new FormGroup(<IWorkoutFormExercise>{}); //HACK -- kind of. Not really initialized correctly unless I'm mistaken. Value should be there though. This is just to make the compiler happy.

  @Output()
  resistanceBandsSelect = new EventEmitter<FormGroup<IWorkoutFormExerciseSet>>();

  @Output()
  showTimerRequest = new EventEmitter<FormGroup<IWorkoutFormExerciseSet>>();

  @Output()
  rangeOfMotionEntered = new EventEmitter();

  @Output()
  durationEdit = new EventEmitter<FormControl<number | null>>();

  public setTypeEnum: typeof SetType = SetType;
  public resistanceTypeEnum: typeof ResistanceType = ResistanceType;

  //Properties
  get setsArray(): FormArray<FormGroup<IWorkoutFormExerciseSet>> { //TODO: Consider refactoring. This is a property, but functionally the same as a method -- not good for using in template expressions!
    //This property provides an easier way for the template to access this information,
    //and is used by the component code as a short-hand reference to the form array.
    return this.formGroup.controls.exerciseSets;
  }

  constructor() { }

  public ngOnInit(): void {
  }

  public selectResistanceBands(formGroup: FormGroup<IWorkoutFormExerciseSet>): void {
    this.resistanceBandsSelect.emit(formGroup);
  }

  public showTimer(formGroup: FormGroup<IWorkoutFormExerciseSet>): void {
    this.showTimerRequest.emit(formGroup);
  }

  public rangeOfMotionChanged(): void {
    this.rangeOfMotionEntered.emit();
  }

  public editDuration(formControl: FormControl<number | null>): void {
    this.durationEdit.emit(formControl);
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
    if (this.formGroup.controls.exerciseSets.length > 1) {
      const source = this.formGroup.controls.exerciseSets.controls[0];

      for(let x = 1; x < this.formGroup.controls.exerciseSets.length; x++) {
        this.formGroup.controls.exerciseSets.controls[x].controls.resistance.setValue(source.controls.resistance.value);
        this.formGroup.controls.exerciseSets.controls[x].controls.resistanceMakeup.setValue(source.controls.resistanceMakeup.value);
        this.formGroup.controls.exerciseSets.controls[x].controls.duration.setValue(source.controls.duration.value);
        this.formGroup.controls.exerciseSets.controls[x].controls.targetReps.setValue(source.controls.targetReps.value);
      }
    }
  }
}
