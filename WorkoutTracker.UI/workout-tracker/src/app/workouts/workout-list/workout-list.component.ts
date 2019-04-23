import { Component, OnInit } from '@angular/core';
import { WorkoutService } from '../workout.service';
import { WorkoutDTO } from 'app/models/workout-dto';

@Component({
  selector: 'wt-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.css']
})
export class WorkoutListComponent {

    //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
    //Turbo Table automatically makes a call to get data on initialization

  private _totalRecords: number;
  private _loading: boolean = true;
  private _pageSize: number = 10;
  private _workouts: WorkoutDTO[];
  private cols: any = [
      { field: 'name', header: 'Name' }
  ]; //TODO: Create specific type

  constructor(private _workoutSvc: WorkoutService) { 
  }

  public getWorkouts(first: number, nameContains: string): void {
      this._loading = true;
      //TODO: Implement
  }

  public getWorkoutsLazy(event: any): void {
      let nameContains: string;

      if (event.filters["name"])
          nameContains = event.filters["name"].value;

      this.getWorkouts(event.first, nameContains);
  }

}
