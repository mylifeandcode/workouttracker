import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { Workout } from 'app/workouts/models/workout';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
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
  public infoMsg: string | null = null;

  //Private fields
  private _saving: boolean = false;
  private _errorMsg: string | null = null;
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
    private _modalSvc: BsModalService) {
  }

  public ngOnInit(): void {
    this.getRouteParams();
    this.createForm();
    this.subscribeToRouteParamsToSetupFormOnWorkoutIdChange();
  }

  private subscribeToRouteParamsToSetupFormOnWorkoutIdChange(): void {
    this._route.params.subscribe(params => {
        this.workoutId = params['id'];
        if (this.workoutId != 0) 
            this.loadWorkout(); 
        else {
          this._workout = new Workout();
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
        active: [true, Validators.required],
        name: ['', Validators.required],
        exercises: this._formBuilder.array([])
    });

  }

  /*
  private async getCurrentUserId(): Promise<number> {
    //TODO: Create edit form base component that would contain this function and be extended by other
    //edit components
    let result: User = await this._userSvc.getCurrentUserInfo().toPromise();
    return result ? result.id : 0;
  }
  */

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
      active: workout.active, 
      name: workout.name
    });

    workout.exercises.forEach(exerciseInWorkout => {
      if(exerciseInWorkout && exerciseInWorkout?.exercise?.name) {
        this.exercisesArray.push(
          this.createExerciseFormGroup(
            exerciseInWorkout.id, exerciseInWorkout.exerciseId, exerciseInWorkout?.exercise?.name, exerciseInWorkout.setType, exerciseInWorkout.numberOfSets));
      }
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
    //this.exercisesArray[index - 1].controls.sequnce
  }

  private moveExerciseDown(index: number): void {
    //Called by button click in template
    let exerciseControl: AbstractControl = this.exercisesArray.at(index);
    this.exercisesArray.removeAt(index);
    this.exercisesArray.insert((index + 1), exerciseControl);
  }

  private saveWorkout(): void {
    //Called by Save button
    
    if (!this.workoutForm.invalid) {
      this.updateWorkoutFromFormValues();

      this._saving = true;
      this.infoMsg = "Saving...";

      if (this._workout.id == 0)
        this.addWorkout();
      else
        this.updateWorkout();

    }
  }

  private addWorkout(): void {
    console.log("ADDING WORKOUT: ", this._workout);
    this._workoutSvc.add(this._workout)
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

  private updateWorkout(): void {
    console.log("UPDATING WORKOUT: ", this._workout);
    this._workoutSvc.update(this._workout)
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
      
    //console.log("getExerciseFormGroup: exerciseInWorkoutId = " + exerciseInWorkoutId + ", exerciseId = " + exerciseId + ", exerciseName = " + exerciseName + ", setType = " + setType + ", numberOfSets = " + numberOfSets);
    return this._formBuilder.group({
      id: exerciseInWorkoutId, 
      exerciseId: exerciseId, 
      exerciseName: [exerciseName, Validators.compose([Validators.required])],
      numberOfSets: [numberOfSets, Validators.compose([Validators.required, Validators.min(1)])], 
      setType: [setType, Validators.compose([Validators.required])]
    });
  }

  private updateWorkoutFromFormValues(): void {
    if (this.workoutForm) {
      console.log("this._workout: ", this._workout);
      this._workout.name = this.workoutForm.get("name")?.value;
      this._workout.exercises = this.getExercisesFromForm();
    }
  }

  private getExercisesFromForm(): Array<ExerciseInWorkout> {
    let output = new Array<ExerciseInWorkout>();
    let index = 0;

    for (let control of this.exercisesArray.controls) {
      if (control instanceof FormGroup) {
        let exerciseGroup = <FormGroup>control;
        if (exerciseGroup) {
          output.push(
            new ExerciseInWorkout(
              exerciseGroup.get("id")?.value,
              exerciseGroup.get("exerciseId")?.value, 
              exerciseGroup.get("exerciseName")?.value, 
              exerciseGroup.get("numberOfSets")?.value, 
              exerciseGroup.get("setType")?.value,
              index) 
          );
        }
        index++;
      }
    }

    return output;
  }
}
