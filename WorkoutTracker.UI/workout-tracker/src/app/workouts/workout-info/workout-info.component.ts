import { Component, Input, OnInit } from '@angular/core';
import { Workout } from '../models/workout';

@Component({
  selector: 'wt-workout-info',
  templateUrl: './workout-info.component.html',
  styleUrls: ['./workout-info.component.css']
})
export class WorkoutInfoComponent implements OnInit {

  @Input()
  workout: Workout;

  constructor() { }

  public ngOnInit(): void {
  }

}
