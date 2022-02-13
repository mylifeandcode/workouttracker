import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

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
  formGroup: FormGroup; //TODO: Use a strong-typed structure

  /*
  @Input()
  exerciseSetsFormArray: FormArray;
  */
 
  @Output()
  resistanceBandsSelect = new EventEmitter<FormGroup>();

  @Output()
  showTimerRequest = new EventEmitter<FormGroup>();

  //Properties
  get setsArray(): FormArray {
    //This property provides an easier way for the template to access this information,
    //and is used by the component code as a short-hand reference to the form array.
    return this.formGroup.get('exerciseSets') as FormArray;
  }

  constructor() { }

  ngOnInit(): void {
  }

  public selectResistanceBands(formGroup: FormGroup): void {
    this.resistanceBandsSelect.emit(formGroup);
  }

  public showTimer(formGroup: FormGroup): void {
    this.showTimerRequest.emit(formGroup);
  }
}
