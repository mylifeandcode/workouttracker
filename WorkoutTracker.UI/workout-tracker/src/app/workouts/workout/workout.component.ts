import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/core/user.service';
import { User } from 'app/core/models/user';
import { finalize } from 'rxjs/operators';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { PaginatedResults } from '../../core/models/paginated-results';
import { ResistanceBandService } from 'app/admin/resistance-bands/resistance-band.service';
import { ResistanceBandSelectComponent } from '../resistance-band-select/resistance-band-select.component';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkout } from '../models/executed-workout';
import { ExecutedExercise } from '../models/executed-exercise';
import * as _ from 'lodash';
import { ResistanceBandSelection } from '../models/resistance-band-selection';


@Component({
  selector: 'wt-workout',
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {

  //PUBLIC FIELDS
  public errorInfo: string;
  public workoutForm: FormGroup;
  public workouts: WorkoutDTO[]; //Refactor. We only need the IDs and Names for this.
  public workout: ExecutedWorkout;
  public showResistanceBandsSelectModal: boolean = false;
  public showCountdownModal: boolean = false;
  public allResistanceBands: ResistanceBandIndividual[] = [];
  public formGroupForResistanceSelection: FormGroup;
  public formGroupForCountdownModal: FormGroup;
  public saving: boolean = false;
  public infoMsg: string;
  public workoutCompleted: boolean = false;
  //END PUBLIC FIELDS

  //VIEWCHILD
  @ViewChild(ResistanceBandSelectComponent) bandSelect: ResistanceBandSelectComponent;

  //PUBLIC PROPERTIES
  public get loading(): boolean {
     return this._apiCallsInProgress > 0; 
  }
  //END PUBLIC PROPERTIES

  //PRIVATE FIELDS
  private _apiCallsInProgress: number = 0;
  //END PRIVATE FIELDS

  /**
   * A property representing all of the Exercises which are part of the Workout
   */
  get exercisesArray(): FormArray {
    //This property provides an easier way for the template to access this information, 
    //and is used by the component code as a short-hand reference to the form array.
    return this.workoutForm.get('exercises') as FormArray;
  }

  /**
   * Specifies whether or not the workout has been started
   */
  get workoutStarted(): boolean {
    return this.workout?.startDateTime != null 
      && new Date(this.workout?.startDateTime).getFullYear() > 1;
  }

  //END PROPERTIES

  constructor(
    private _formBuilder: FormBuilder,
    private _workoutService: WorkoutService, 
    private _executedWorkoutService: ExecutedWorkoutService, 
    private _userService: UserService, 
    private _resistanceBandService: ResistanceBandService) { 
  }
  

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public ngOnInit(): void {
    this.createForm();
    this.getCurrentUserInfo();
    this.getResistanceBands();
  }

  public workoutSelected(worktoutId: number) { 
    this.setupWorkout(worktoutId);
  }

  public resistanceBandsModalEnabled(exerciseFormGroup: FormGroup): void {
    this.showResistanceBandsSelectModal = true;
    this.formGroupForResistanceSelection = exerciseFormGroup;
    this.bandSelect.setBandAllocation(
      exerciseFormGroup.controls.resistanceMakeup.value, 
      !exerciseFormGroup.controls.bandsEndToEnd.value);
  }

  public resistanceBandsModalAccepted(selectedBands: ResistanceBandSelection): void {
    this.formGroupForResistanceSelection.patchValue({ 
      resistanceMakeup: selectedBands.makeup, 
      resistance: selectedBands.maxResistanceAmount 
    });
    this.showResistanceBandsSelectModal = false;
  }

  public resistanceBandsModalCancelled(): void {
    this.showResistanceBandsSelectModal = false;
  }

  public showTimer(exerciseFormGroup: FormGroup): void {
    this.formGroupForCountdownModal = exerciseFormGroup;
    this.showCountdownModal = true;
  }

  public startWorkout(): void {
    this.workout.startDateTime = new Date();
    this.workoutForm.controls.journal.enable();
    this.workoutForm.controls.exercises.enable();
    this.workout.createdByUserId = this._userService.currentUserId;
  }

  public completeWorkout(): void {
    this.setWorkoutValuesFromFormGroup();
    this.workout.endDateTime = new Date();
    this.postWorkoutToServer();
  }
  
  //PRIVATE METHODS ///////////////////////////////////////////////////////////

  private createForm(): void {
    this.workoutForm = this._formBuilder.group({
        id: [0, Validators.required ], 
        //workoutDefinitions: [''], //https://coryrylan.com/blog/creating-a-dynamic-select-with-angular-forms
        exercises: this._formBuilder.array([]), 
        journal: ['']
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
    this._resistanceBandService.getAllIndividualBands()
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe(
        (bands: ResistanceBandIndividual[]) => {
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
    this._executedWorkoutService.getNew(id)
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe(
          (executedWorkout: ExecutedWorkout) => {
          this.workout = executedWorkout;
          this.workoutForm.patchValue({
            id: id
          });
          this.setupExercisesFormGroup(executedWorkout.exercises);
        }, 
        (error: any) => { this.setErrorInfo(error, "An error occurred getting workout information. See console for details."); }
      );
  }

  private setupExercisesFormGroup(exercises: ExecutedExercise[]): void {
    this.exercisesArray.clear();

    //Group ExecutedExercise by Exercise and Set Type
    let groupedExercises = _.groupBy(exercises, (exercise: ExecutedExercise) => { 
        return exercise.exercise.id.toString() + '-' + exercise.setType.toString(); 
      });

    _.forEach(groupedExercises, (exerciseArray: ExecutedExercise[]) => {

      this.exercisesArray.push(
        this._formBuilder.group({
          id: exerciseArray[0].id, //WARN: Pretty sure this will still just be 0 at this point
          exerciseId: exerciseArray[0].exercise.id, 
          exerciseName: [exerciseArray[0].exercise.name, Validators.compose([Validators.required])],
          exerciseSets: this.getExerciseSetsFormArray(exerciseArray), 
          setType: [exerciseArray[0].setType, Validators.compose([Validators.required])], 
          resistanceType: [exerciseArray[0].exercise.resistanceType, Validators.compose([Validators.required])]
        })
      );

    });

    //this.exercisesArray.disable();
  }

  private getExerciseSetsFormArray(exercises: ExecutedExercise[]): FormArray {

    let formArray = this._formBuilder.array([]);

    //Each member of the array is a FormGroup
    for(let i = 0; i < exercises.length; i++) {
      let formGroup = this._formBuilder.group({
        sequence: [exercises[i].sequence], 
        resistance: [exercises[i].resistanceAmount, Validators.required], 
        targetReps: [exercises[i].targetRepCount, Validators.required], //TODO: Populate with data from API once refactored to provide it!
        actualReps: [0, Validators.required], 
        formRating: [null, Validators.required], 
        rangeOfMotionRating: [null, Validators.required], 
        resistanceMakeup: [exercises[i].resistanceMakeup], 
        bandsEndToEnd: [exercises[i].exercise.bandsEndToEnd], //TODO: This is kind of a hack, as this value is at the exercise, not set level, and is therefore duplicated here
        duration: [120] //TODO: Get/set value from API
      });

      formGroup.controls.actualReps.disable();
      formGroup.controls.formRating.disable();
      formGroup.controls.rangeOfMotionRating.disable();

      formArray.push(formGroup);
    }

    return formArray;
  }

  private setErrorInfo(error: any, defaultMessage: string): void {
    if (error.message)
      this.errorInfo = error.message;
    else
      this.errorInfo = defaultMessage;
  }

  private setWorkoutValuesFromFormGroup(): void {
    this.workout.journal = this.workoutForm.controls.journal.value;

    this.exercisesArray.controls.forEach((value: AbstractControl) => {
      let formGroup = <FormGroup>value;
      let sets = <FormArray>formGroup.controls.exerciseSets.value;
      let exerciseId = formGroup.controls.exerciseId.value;
      let exercises = this.workout.exercises.filter((exercise: ExecutedExercise) => {
        return exercise.exercise.id == exerciseId; 
      });

      exercises = exercises.sort((a: ExecutedExercise, b: ExecutedExercise) => a.sequence - b.sequence);

      if(exercises.length != sets.length) {
        window.alert("Exercises/FormArray length mismatch."); //TODO: Handle this a better way
        return;
      }

      for(let x = 0; x < exercises.length; x++) {
        exercises[x].actualRepCount = sets[x].actualReps;
        exercises[x].duration = sets[x].duration;
        //exercises[x].notes //TODO: Implement
        exercises[x].resistanceAmount = sets[x].resistance;
        exercises[x].resistanceMakeup = sets[x].resistanceMakeup;
        exercises[x].targetRepCount = sets[x].targetReps;
        exercises[x].sequence = x;
        exercises[x].formRating = sets[x].formRating;
        exercises[x].rangeOfMotionRating = sets[x].rangeOfMotionRating;
      }

    });
    
  }

  private postWorkoutToServer(): void {
    this.saving = true;
    this._executedWorkoutService
      .add(this.workout)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe((workout: ExecutedWorkout) => {
          this.workout = workout;
          this.infoMsg = "Completed workout saved at " + new Date().toLocaleTimeString();
          this.workoutCompleted = true;
        }, 
        (error: any) => { this.setErrorInfo(error, "An error occurred saving workout information. See console for details."); 
      });
  }

}
