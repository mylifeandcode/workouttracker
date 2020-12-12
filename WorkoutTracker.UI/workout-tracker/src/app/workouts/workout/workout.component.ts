import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/core/user.service';
import { User } from 'app/core/models/user';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { PaginatedResults } from '../../core/models/paginated-results';
import { ExerciseInWorkout } from '../models/exercise-in-workout';
import { ResistanceBandService } from 'app/admin/resistance-bands/resistance-band.service';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ResistanceBandSelectComponent } from '../resistance-band-select/resistance-band-select.component';

@Component({
  selector: 'wt-workout',
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {

  //PUBLIC FIELDS
  //public loading: boolean = true;
  public errorInfo: string;
  public workoutForm: FormGroup;
  public workouts: WorkoutDTO[]; //Refactor. We only need the IDs and Names for this.
  public workout: WorkoutDTO;
  public showResistanceBandsSelectModal: boolean = false;
  public allResistanceBands: ResistanceBand[] = [];
  @ViewChild(ResistanceBandSelectComponent) bandSelect: ResistanceBandSelectComponent;
  //END PUBLIC FIELDS

  //PUBLIC PROPERTIES
  public get loading(): boolean {
     return this._apiCallsInProgress > 0; 
  }
  //END PUBLIC PROPERTIES

  private _apiCallsInProgress: number = 0;

  /**
   * A property representing all of the Exercises which are part of the Workout
   */
  get exercisesArray(): FormArray {
    //This property provides an easier way for the template to access this information, 
    //and is used by the component code as a short-hand reference to the form array.
    return this.workoutForm.get('exercises') as FormArray;
  }

  //END PROPERTIES

  constructor(
    private _formBuilder: FormBuilder,
    private _workoutService: WorkoutService,
    private _userService: UserService, 
    private _resistanceBandService: ResistanceBandService) { 
  }

  public ngOnInit(): void {
    this.createForm();
    this.getCurrentUserInfo();
    this.getResistanceBands();
  }

  public workoutSelected(event: any) { //TODO: Get concrete type instead of using any
    this.setupWorkout(event.target.value);
  }

  public resistanceBandsModalEnabled(currentResistance: string) {
    this.showResistanceBandsSelectModal = true;
    this.bandSelect.setBandAllocation(null);
  }

  private createForm(): void {
    this.workoutForm = this._formBuilder.group({
        id: [0, Validators.required ], 
        workoutDefinitions: [''], //https://coryrylan.com/blog/creating-a-dynamic-select-with-angular-forms
        exercises: this._formBuilder.array([])
    });
  }

  private getCurrentUserInfo(): void {
    this._apiCallsInProgress++;
    this._userService.getCurrentUserInfo()
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe(
        (user: User) => {
          this.getWorkoutDefinitons(user.id);
        }, 
        (error: any) => {
          this.setErrorInfo(error, "An error occurred getting user info. See console for more info.");
        }
      );
  }

  private getResistanceBands(): void {
    this._apiCallsInProgress++;
    this._resistanceBandService.getAll()
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe(
        (bands: ResistanceBand[]) => {
          this.allResistanceBands = bands;
        }, 
        (error: any) => {
          this.setErrorInfo(error, "An error occurred getting resistance bands. See console for more info.");
        }
      );
  }
  
  private getWorkoutDefinitons(userId: number): void {
    this._workoutService.getAll(0, 500, userId) //TODO: Clean this up. Don't harcode page size of 500. Maybe a better endpoint is needed for this.
      .pipe(finalize(() => {
        this._apiCallsInProgress--;
      }))
      .subscribe(
        (workouts: PaginatedResults<WorkoutDTO>) => {
          //TODO: Add each workout as an item in the workoutDefinitions array
          if(workouts?.results != null) {
            this.workouts = workouts.results;
          }
        }, 
        (error: any) => {
          this.setErrorInfo(error, "An error occurred getting workout definitions. See console for details.");
        }
      );
  }

  private setupWorkout(id: number): void {
    this._apiCallsInProgress++;
    this._workoutService.getDTObyId(id)
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe(
        (workout: WorkoutDTO) => { 
          //TODO: Separate endpoint to return workout w/recommended resistance values
          this.workout = workout;
          this.workoutForm.patchValue({
            id: id
          });
          this.setupExercisesFormGroup(workout.exercises);
        }, 
        (error: any) => { this.setErrorInfo(error, "An error occurred getting workout information. See console for details."); }
      );
  }

  private setupExercisesFormGroup(exercises: ExerciseInWorkout[]): void {
    this.exercisesArray.clear();
    exercises.forEach(exercise => {
      this.exercisesArray.push(
        this._formBuilder.group({
          id: exercise.id, 
          exerciseId: exercise.exerciseId, 
          exerciseName: [exercise.exerciseName, Validators.compose([Validators.required])],
          numberOfSets: [exercise.numberOfSets, Validators.compose([Validators.required, Validators.min(1)])], 
          exerciseSets: this.getExerciseSetsFormArray(exercise.numberOfSets), //This is a FormArray of FormGroups. Each group represents a set, with a Target Rep control and an Actual Rep control.
          setType: [exercise.setType, Validators.compose([Validators.required])]
        }) 
      )
    });
  }

  private getExerciseSetsFormArray(numberOfSets: number): FormArray {

    let formArray = this._formBuilder.array([]);

    //Each member of the array is a FormGroup
    for(let i = 0; i < numberOfSets; i++) {
      formArray.push(this._formBuilder.group({
        resistance: [0, Validators.required], 
        targetReps: [0, Validators.required], //TODO: Populate with data from API once refactored to provide it!
        actualReps: [0, Validators.required], 
        formRating: [null, Validators.required], 
        rangeOfMotionRating: [null, Validators.required]
      }));
    }

    return formArray;
    
  }

  private setErrorInfo(error: any, defaultMessage: string): void {
    if (error.message)
      this.errorInfo = error.message;
    else
      this.errorInfo = defaultMessage;
  }

}
