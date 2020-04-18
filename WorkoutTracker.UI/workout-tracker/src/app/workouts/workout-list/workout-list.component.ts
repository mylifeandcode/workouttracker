import { Component, OnInit } from '@angular/core';
import { WorkoutService } from '../workout.service';
import { WorkoutDTO } from 'app/models/workout-dto';

@Component({
  selector: 'wt-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.css']
})
export class WorkoutListComponent implements OnInit {

  //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
  //Turbo Table automatically makes a call to get data on initialization

  public totalRecords: number;
  public loading: boolean = true;
  public pageSize: number = 10;
  private _workouts: WorkoutDTO[];
  private cols: any = [
      { field: 'name', header: 'Name' }
  ]; //TODO: Create specific type

  constructor(private _workoutSvc: WorkoutService) { 
  }

  ngOnInit(): void {
      this.getWorkouts(0, null);
  }

  public getWorkouts(first: number, nameContains: string): void {
      this.loading = true;
      //TODO: Implement
      this.totalRecords = 0;
      this.loading = false;
  }

  public getWorkoutsLazy(event: any): void {
      let nameContains: string;

      if (event.filters["name"])
          nameContains = event.filters["name"].value;

      this.getWorkouts(event.first, nameContains);
  }

}
