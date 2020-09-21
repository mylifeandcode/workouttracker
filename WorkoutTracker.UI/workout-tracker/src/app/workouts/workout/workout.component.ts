import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/users/user.service';
import { User } from 'app/models/user';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from 'app/models/workout-dto';
import { PaginatedResults } from 'app/models/paginated-results';

@Component({
  selector: 'wt-workout',
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {

  public loading: boolean = true;
  public errorInfo: string;
  public workoutForm: FormGroup;
  public workouts: WorkoutDTO[];

  constructor(
    private _formBuilder: FormBuilder,
    private _workoutService: WorkoutService,
    private _userService: UserService) { 
  }

  public async ngOnInit(): Promise<void> {
    this.createForm();
    
    this._userService.getCurrentUserInfo()
      .subscribe(
        (user: User) => {
          this.getWorkoutDefinitons(user.id);
        }, 
        (error: any) => {
          this.loading = false;
        }
      );

  }

  public workoutSelected(event: any) { //TODO: Get concrete type
    console.log("event: ", event);
    window.alert(event.target.value);
  }

  private createForm(): void {

    this.workoutForm = this._formBuilder.group({
        id: [0, Validators.required ], 
        name: ['', Validators.required],
        workoutDefinitions: [''] //https://coryrylan.com/blog/creating-a-dynamic-select-with-angular-forms
    });

  }
  
  private getWorkoutDefinitons(userId: number): void {
    this._workoutService.getAll(0, 500, userId) //TODO: Clean this up. Don't harcode page size of 500. Maybe a better endpoint is needed for this.
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe(
        (workouts: PaginatedResults<WorkoutDTO>) => {
          //TODO: Add each workout as an item in the workoutDefinitions array
          if(workouts?.results != null) {
            this.workouts = workouts.results;
          }
        }, 
        (error: any) => {
          if (error.message)
            this.errorInfo = error.message;
          else
            this.errorInfo = "An error occurred getting workout definitions. See console for details.";
        }
      );
  }

}
