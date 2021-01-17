import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkoutDTO } from '../models/workout-dto';

@Component({
  selector: 'wt-workout-select',
  templateUrl: './workout-select.component.html',
  styleUrls: ['./workout-select.component.css']
})
export class WorkoutSelectComponent implements OnInit {

  @Input()
  workouts: WorkoutDTO[];

  @Output()
  workoutSelected: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  public workoutSelectChange(event: any): void { //TODO: Get concrete type instead of using any
    this.workoutSelected.emit(event.target.value);
  }

}
