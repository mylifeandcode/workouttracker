import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ResistanceBandService } from 'app/admin/resistance-bands/resistance-band.service';
import { ResistanceBandSelectComponent } from '../resistance-band-select/resistance-band-select.component';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkout } from '../models/executed-workout';
import { ExecutedExercise } from '../models/executed-exercise';
import * as _ from 'lodash';
import { ResistanceBandSelection } from '../models/resistance-band-selection';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'wt-workout',
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {

  //PUBLIC FIELDS
  public errorInfo: string;
  public workoutForm: FormGroup;
  //public workouts: WorkoutDTO[]; //Refactor. We only need the IDs and Names for this.
  public workout: ExecutedWorkout; //TODO: Make this private, and instead expose the date values the template needs as component properties
  public showResistanceBandsSelectModal: boolean = false;
  public showCountdownModal: boolean = false;
  public allResistanceBands: ResistanceBandIndividual[] = [];
  public formGroupForResistanceSelection: FormGroup;
  public formGroupForCountdownModal: FormGroup;
  public countdownModalActivatedDateTime: Date;
  public saving: boolean = false;
  public infoMsg: string;
  public workoutCompleted: boolean = false;
  //END PUBLIC FIELDS

  //VIEWCHILD
  @ViewChild(ResistanceBandSelectComponent) bandSelect: ResistanceBandSelectComponent;

  //PUBLIC PROPERTIES
  /**
   * A property indicating whether or not the component is loading information it requires
   */
  public get loading(): boolean {
     return this._apiCallsInProgress > 0; 
  }

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
  //END PUBLIC PROPERTIES

  //PRIVATE FIELDS
  private _executedWorkoutId: number = 0;
  private _apiCallsInProgress: number = 0;
  //END PRIVATE FIELDS

  constructor(
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _executedWorkoutService: ExecutedWorkoutService, 
    private _resistanceBandService: ResistanceBandService, 
    private _messageService: MessageService) { 
  }
  

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  public ngOnInit(): void {
    this.createForm();
    this.getResistanceBands();
    this.subscribeToRouteParams();
    this.startWorkout();
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
    this.countdownModalActivatedDateTime = new Date();
    this.showCountdownModal = true;
  }

  public startWorkout(): void {
    this.workoutForm.controls.journal.enable();
    this.workoutForm.controls.exercises.enable();
  }

  public completeWorkout(): void {
    this.setWorkoutValuesFromFormGroup();
    this.workout.endDateTime = new Date();
    this.persistWorkoutToServer(true);
  }

  public saveWorkoutInProgress(): void {
    this.setWorkoutValuesFromFormGroup();
    this.persistWorkoutToServer(false);
  }
  
  //PRIVATE METHODS ///////////////////////////////////////////////////////////

  private subscribeToRouteParams(): void {
    this._route.params.subscribe((params) => {
      this._executedWorkoutId = params['executedWorkoutId'];
      this.setupWorkout(this._executedWorkoutId);
    });
  }

  private createForm(): void {
    this.workoutForm = this._formBuilder.group({
        id: [0, Validators.required ], 
        //workoutDefinitions: [''], //https://coryrylan.com/blog/creating-a-dynamic-select-with-angular-forms
        exercises: this._formBuilder.array([]), 
        journal: ['']
    });
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
  
  private setupWorkout(id: number): void {
    this._apiCallsInProgress++;
    this._executedWorkoutService.getById(id)
      .pipe(finalize(() => { this._apiCallsInProgress--; }))
      .subscribe(
        (executedWorkout: ExecutedWorkout) => {
          this.workout = executedWorkout;

          if (this.workout.startDateTime == null)
            this.workout.startDateTime = new Date();

          this.workoutForm.patchValue({
            id: id
          });
          
          this.setupExercisesFormGroup(executedWorkout.exercises);

          this.workoutCompleted = (this.workout.endDateTime != null);

          if (executedWorkout.journal) {
            this.workoutForm.controls.journal.setValue(executedWorkout.journal);
          }
        }, 
        (error: any) => { this.setErrorInfo(error, "An error occurred getting workout information. See console for details."); }
      );
  }

  private setupExercisesFormGroup(exercises: ExecutedExercise[]): void {
    this.exercisesArray.clear();

    /*
    exercises = exercises.sort((a: ExecutedExercise, b: ExecutedExercise) => a.sequence - b.sequence);

    //Group ExecutedExercise by Exercise and Set Type
    let groupedExercises = _.groupBy(exercises, (exercise: ExecutedExercise) => { 
        return exercise.exercise.id.toString() + '-' + exercise.setType.toString(); 
      });
    */
    let groupedExercises = this._executedWorkoutService.groupExecutedExercises(exercises);

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
        actualReps: [exercises[i].actualRepCount ? exercises[i].actualRepCount : 0, Validators.required], 
        formRating: [exercises[i].formRating ? exercises[i].formRating : null, Validators.required], 
        rangeOfMotionRating: [exercises[i].rangeOfMotionRating ? exercises[i].rangeOfMotionRating : null, Validators.required], 
        resistanceMakeup: [exercises[i].resistanceMakeup], 
        bandsEndToEnd: [exercises[i].exercise.bandsEndToEnd], //TODO: This is kind of a hack, as this value is at the exercise, not set level, and is therefore duplicated here
        duration: [120] //TODO: Get/set value from API
      });

      //formGroup.controls.actualReps.disable();
      //formGroup.controls.formRating.disable();
      //formGroup.controls.rangeOfMotionRating.disable();

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
      let sets: FormArray = <FormArray>formGroup.controls.exerciseSets;
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
        const setControls = (sets.at(x) as FormGroup).controls;
        //exercises[x].actualRepCount = Number(sets[x].actualReps);
        exercises[x].actualRepCount = Number(setControls.actualReps.value);
        //exercises[x].duration = sets[x].duration;
        exercises[x].duration = setControls.duration.value;
        //exercises[x].notes //TODO: Implement
        //exercises[x].resistanceAmount = sets[x].resistance;
        exercises[x].resistanceAmount = setControls.resistance.value;
        //exercises[x].resistanceMakeup = sets[x].resistanceMakeup;
        exercises[x].resistanceMakeup = setControls.resistanceMakeup.value;
        //exercises[x].targetRepCount = Number(sets[x].targetReps);
        exercises[x].targetRepCount = Number(setControls.targetReps.value);
        //exercises[x].sequence = x;
        //exercises[x].formRating = Number(sets[x].formRating);
        exercises[x].formRating = Number(setControls.formRating.value);
        //exercises[x].rangeOfMotionRating = Number(sets[x].rangeOfMotionRating);
        exercises[x].rangeOfMotionRating = Number(setControls.rangeOfMotionRating.value);
      }

    });
    
  }

  private persistWorkoutToServer(completed: boolean): void {
    this.saving = true;
    this._executedWorkoutService
      .update(this.workout)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe((workout: ExecutedWorkout) => {
          this.workout = workout;
          if (completed) {
            this.infoMsg = "Completed workout saved at " + new Date().toLocaleTimeString();
            this.workoutCompleted = true;
            this._messageService.add({severity:'success', summary: 'Success!', detail: 'Workout completed!', life: 5000});
          }
          else
            this._messageService.add({severity:'success', summary: 'Success!', detail: 'Progress updated!', life: 1000});
        }, 
        (error: any) => { this.setErrorInfo(error, "An error occurred saving workout information. See console for details."); 
      });
  }

}
