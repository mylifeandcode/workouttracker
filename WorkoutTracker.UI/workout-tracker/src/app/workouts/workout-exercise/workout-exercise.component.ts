import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { IWorkoutFormExercise } from '../interfaces/i-workout-form-exercise';
import { IWorkoutFormExerciseSet } from '../interfaces/i-workout-form-exercise-set';

/**
 * A component representing an Exercise as part of a Workout instance,
 * i.e. "The Chest and Arms Workout on 10/7/2020 includes 5 sets of Diamond Push-Ups with a
 * target rep count of 30 for each set, and an actual rep count of how many I actually did."
 */
@Component({
  selector: 'wt-workout-exercise',
  templateUrl: './workout-exercise.component.html',
  styleUrls: ['./workout-exercise.component.css']
})
export class WorkoutExerciseComponent implements OnInit {

  /**
   * The FormGroup containing FormControls for the Exercise Name, Type, etc, as well as
   * a FormArray for the Sets
   */
  @Input()
  formGroup: FormGroup<IWorkoutFormExercise>;

  /*
  @Input()
  exerciseSetsFormArray: FormArray;
  */
 
  @Output()
  resistanceBandsSelect = new EventEmitter<FormGroup<IWorkoutFormExerciseSet>>();

  @Output()
  showTimerRequest = new EventEmitter<FormGroup<IWorkoutFormExerciseSet>>();

  @Output()
  rangeOfMotionEntered = new EventEmitter();

  @Output()
  durationEdit = new EventEmitter<FormControl<number | null>>();

  //Properties
  get setsArray(): FormArray<FormGroup<IWorkoutFormExerciseSet>> {
    //This property provides an easier way for the template to access this information,
    //and is used by the component code as a short-hand reference to the form array.
    return this.formGroup.controls.exerciseSets;
  }

  constructor() { }

  ngOnInit(): void {
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
}
