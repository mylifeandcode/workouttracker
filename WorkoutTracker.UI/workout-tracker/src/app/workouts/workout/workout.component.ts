import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/users/user.service';

@Component({
  selector: 'wt-workout',
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {

  public loading: boolean = true;
  public workoutForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _workoutSvc: WorkoutService,
    private _userSvc: UserService, 
  ) { }

  public ngOnInit(): void {
    this.createForm();
    this.loading = false;
  }

  private createForm(): void {

    this.workoutForm = this._formBuilder.group({
        id: [0, Validators.required ], 
        name: ['', Validators.required],
        workoutDefinitions: this._formBuilder.array([])
    });

  }
  
  private getWorkoutDefinitons(): void {
    
  }

}
