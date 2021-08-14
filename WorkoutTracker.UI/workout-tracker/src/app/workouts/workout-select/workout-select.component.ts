import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private _router: Router) { }

  ngOnInit(): void {
  }

  public workoutSelectChange(event: any): void { //TODO: Get concrete type instead of using any
    //this.workoutSelected.emit(event.target.value);
    this._router.navigate([`workouts/plan/${event.target.value}`]);
  }

}
