import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ExerciseInWorkout } from 'app/models/exercise-in-workout';

@Component({
  selector: 'wt-workout-exercise',
  templateUrl: './workout-exercise.component.html',
  styleUrls: ['./workout-exercise.component.css']
})
export class WorkoutExerciseComponent implements OnInit {

  @Input()
  exercise: ExerciseInWorkout;

  @Input()
  formGroup: FormGroup;

  //Properties
  get setsArray(): FormArray {
    //This property provides an easier way for the template to access this information, 
    //and is used by the component code as a short-hand reference to the form array.
    return this.formGroup.get('exerciseSets') as FormArray;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
