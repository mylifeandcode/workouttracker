import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/core/user.service';
import { Workout } from 'app/workouts/models/workout';
import { User } from 'app/core/models/user';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { ExerciseInWorkout } from '../models/exercise-in-workout';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-workout-edit',
  templateUrl: './workout-edit.component.html',
  styleUrls: ['./workout-edit.component.css']
})
export class WorkoutEditComponent implements OnInit {

  //A helfpul link for dynamic form arrays: https://codinglatte.com/posts/angular/angular-dynamic-form-fields-using-formarray/

  //Public fields
  public workoutId: number;
  public workoutForm: FormGroup;
  public loading: boolean = true;
  public infoMsg: string = null;

  //Private fields
  private _saving: boolean = false;
  private _errorMsg: string = null;
  private _currentUserId: number; //The ID of the user performing the add or edit
  private _modalRef: BsModalRef;
  private _workout: Workout;

  //Properties
  get exercisesArray(): FormArray {
    return this.workoutForm.get('exercises') as FormArray;
  }

  constructor(
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _workoutSvc: WorkoutService,
    private _userSvc: UserService, 
    private _modalSvc: BsModalService) {
  }

  async ngOnInit() {

    this.getRouteParams();
    this.createForm();

    this._currentUserId = await this.getCurrentUserId();

    /*
    if (this._workoutId != 0) 
        this.loadWorkout(); //Is this safe? route.params is an observable.
    else
      this.loading = false;
    */

    this.subscribeToRouteParamsToSetupFormOnWorkoutIdChange();
  }

  private subscribeToRouteParamsToSetupFormOnWorkoutIdChange(): void {
    this._route.params.subscribe(params => {
        console.log("params['id']: ", params['id']);
        this.workoutId = params['id'];
        if (this.workoutId != 0) 
            this.loadWorkout(); 
        else {
            this.loading = false;
        }
    });
}  

  private openModal(template: TemplateRef<any>): void {
    this._modalRef = this._modalSvc.show(template);
  }

  private getRouteParams(): void {
    this._route.params.subscribe(params => {
        this.workoutId = params['id'];
    });
  }

  private createForm(): void {

    this.workoutForm = this._formBuilder.group({
        id: [0, Validators.required ], 
        name: ['', Validators.required],
        exercises: this._formBuilder.array([])
    });

  }

  private async getCurrentUserId(): Promise<number> {
    //TODO: Create edit form base component that would contain this function and be extended by other
    //edit components
    let result: User = await this._userSvc.getCurrentUserInfo().toPromise();
    return result ? result.id : 0;
  }


  private loadWorkout(): void {
    this.loading = true;
    this._workoutSvc.getById(this.workoutId).subscribe((workout: Workout) => {
        this.updateFormWithWorkoutValues(workout);
        this.loading = false;
        this._workout = workout;
    }); //TODO: Handle errors
  }

  private updateFormWithWorkoutValues(workout: Workout): void {
    this.workoutForm.patchValue({
      id: workout.id, 
      name: workout.name
    });

    workout.exercises.forEach(exerciseInWorkout => {
      this.exercisesArray.push(
        this.createExerciseFormGroup(
          exerciseInWorkout.id, exerciseInWorkout.exerciseId, exerciseInWorkout.exercise.name, exerciseInWorkout.setType, exerciseInWorkout.numberOfSets));
    });
  }

  private addExercise(exercise: ExerciseDTO): void {
    //Called by button click in template
    this._modalRef.hide();     //TODO: Check this out: https://valor-software.com/ngx-bootstrap/#/modals
    this.exercisesArray.push(this.createExerciseFormGroup(0, exercise.id, exercise.name));
  }

  private removeExercise(index: number): void {
    //Called by button click in template
    this.exercisesArray.removeAt(index);
  }

  private moveExerciseUp(index: number): void {
    //Called by button click in template
    let exerciseControl: AbstractControl = this.exercisesArray.at(index);
    this.exercisesArray.removeAt(index);
    this.exercisesArray.insert((index - 1), exerciseControl);
  }

  private moveExerciseDown(index: number): void {
    //Called by button click in template
    let exerciseControl: AbstractControl = this.exercisesArray.at(index);
    this.exercisesArray.removeAt(index);
    this.exercisesArray.insert((index + 1), exerciseControl);
  }

  private getWorkoutDTOFromWorkout(workout: Workout): WorkoutDTO {
    //TODO: Implement
    return null;
  }

  private saveWorkout(): void {
    //Called by Save button
    
    if (!this.workoutForm.invalid) {
      const workout = this.getWorkoutForPersist();

      this._saving = true;
      this.infoMsg = "Saving...";

      if (workout.id == 0)
        this.addWorkout(workout);
      else
        this.updateWorkout(workout);

    }
  }

  private addWorkout(workout: Workout): void {

    this._workoutSvc.add(workout)
      .pipe(finalize(() => {
          this._saving = false;
      }))
      .subscribe((addedWorkout: Workout) => {
          //this.workout = value;
          this.workoutId = addedWorkout.id;
          this.infoMsg = "Workout created at " + new Date().toLocaleTimeString();
      },
      (error: any) => {
          this._errorMsg = error.message;
          this.infoMsg = null;
      }
    );
  
  }

  private updateWorkout(workout: Workout): void {
    console.log("WORKOUT: ", workout);
    this._workoutSvc.update(workout)
      .pipe(finalize(() => {
          this._saving = false;
      }))
      .subscribe((updatedWorkout: Workout) => {
          this._saving = false;
          this.infoMsg = "Workout updated at " + new Date().toLocaleTimeString();
      }, 
      (error: any) => {
          console.log("ERROR: ", error);
          this._errorMsg = error.message;
          this.infoMsg = null;
      }
    );

  }

  private createExerciseFormGroup(
    exerciseInWorkoutId: number, 
    exerciseId: number, 
    exerciseName: string, 
    setType: number = 0, 
    numberOfSets: number = 0): FormGroup {
      
    console.log("getExerciseFormGroup: exerciseInWorkoutId = " + exerciseInWorkoutId + ", exerciseId = " + exerciseId + ", exerciseName = " + exerciseName + ", setType = " + setType + ", numberOfSets = " + numberOfSets);
    return this._formBuilder.group({
      id: exerciseInWorkoutId, 
      exerciseId: exerciseId, 
      exerciseName: [exerciseName, Validators.compose([Validators.required])],
      numberOfSets: [numberOfSets, Validators.compose([Validators.required, Validators.min(1)])], 
      setType: [setType, Validators.compose([Validators.required])]
    });
  }

  private getWorkoutForPersist(): Workout {
    let workout = new Workout();
    workout.id = this.workoutId;
    workout.userId = this._currentUserId;

    if (workout.id == 0) {
      workout.createdByUserId = this._currentUserId;
      workout.createdDateTime = new Date();
    }
    else {
      workout.createdByUserId = this._workout.createdByUserId;
      workout.createdDateTime = this._workout.createdDateTime;
    }

    workout.modifiedByUserId = this._currentUserId;
    workout.modifiedDateTime = new Date();

    workout.name = this.workoutForm.get("name").value;
    workout.exercises = this.getExercisesFromForm();

    return workout;
  }

  private getExercisesFromForm(): Array<ExerciseInWorkout> {
    let output = new Array<ExerciseInWorkout>();

    for (let control of this.exercisesArray.controls) {
      if (control instanceof FormGroup) {
        let exerciseGroup = <FormGroup>control;
        output.push(
          new ExerciseInWorkout(
            exerciseGroup.get("id").value,
            exerciseGroup.get("exerciseId").value, 
            exerciseGroup.get("exerciseName").value, 
            exerciseGroup.get("numberOfSets").value, 
            exerciseGroup.get("setType").value,
            null) //ResistanceType is used for display only. It's a property on the Exercise class.
        );
      }
    }

    return output;
  }
}
