import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Validators, AbstractControl, FormControl, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { Workout } from 'app/workouts/models/workout';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { ExerciseInWorkout } from '../models/exercise-in-workout';
import { finalize } from 'rxjs/operators';

interface IExerciseInWorkout {
  id: FormControl<number>;
  exerciseId: FormControl<number>; 
  exerciseName: FormControl<string>;
  numberOfSets: FormControl<number>;
  setType: FormControl<number>;
}

interface IWorkoutEditForm {
  id: FormControl<number>;
  active: FormControl<boolean>;
  name: FormControl<string>;
  exercises: FormArray<FormGroup<IExerciseInWorkout>>;
}

@Component({
  selector: 'app-workout-edit',
  templateUrl: './workout-edit.component.html',
  styleUrls: ['./workout-edit.component.css']
})
export class WorkoutEditComponent implements OnInit {

  //A helfpul link for dynamic form arrays: https://codinglatte.com/posts/angular/angular-dynamic-form-fields-using-formarray/

  //Public fields
  public workoutId: number;
  public workoutForm: FormGroup<IWorkoutEditForm>;
  public loading: boolean = true;
  public infoMsg: string | null = null;
  public showExerciseSelectModal: boolean = false;
  public readOnlyMode: boolean = false;
  public fromViewRoute: boolean = false;
  public errorMsg: string | null = null;
  public saving: boolean = false;

  //Private fields
  private _workout: Workout;

  //Properties
  get exercisesArray(): FormArray<FormGroup<IExerciseInWorkout>> {
    return this.workoutForm.controls.exercises;
  }

  constructor(
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _workoutService: WorkoutService) {
  }

  public ngOnInit(): void {
    this.readOnlyMode = this.fromViewRoute = this._route.snapshot.url.join('').indexOf('view') > -1;
    this.getWorkoutIdFromRouteParams();
    this.createForm();
    this.setupForm();
  }

  public editModeToggled(event: any): void { //TODO: Get or specify a concrete type for the event param
    this.readOnlyMode = !event.checked;
  }

  private setupForm(): void {
    if (this.workoutId != 0) 
      this.loadWorkout(); 
    else {
      this._workout = new Workout();
      this.loading = false;
    }
  }  

  public openModal(): void {
    this.showExerciseSelectModal = true;
  }

  private getWorkoutIdFromRouteParams(): void {
    this.workoutId = this._route.snapshot.params['id'];
  }

  private createForm(): void {

    this.workoutForm = this._formBuilder.group<IWorkoutEditForm>({
        id: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }), 
        active: new FormControl<boolean>(true, { nonNullable: true, validators: Validators.required }), 
        name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }), 
        exercises: new FormArray<FormGroup<IExerciseInWorkout>>([])
    });

  }

  private loadWorkout(): void {
    this.loading = true;
    this._workoutService.getById(this.workoutId).subscribe((workout: Workout) => {
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

  public addExercise(exercise: ExerciseDTO): void {
    this.exercisesArray.push(this.createExerciseFormGroup(0, exercise.id, exercise.name));
  }

  public removeExercise(index: number): void {
    //Called by button click in template
    this.exercisesArray.removeAt(index);
  }

  public moveExerciseUp(index: number): void {
    //Called by button click in template
    let exerciseControl: FormGroup<IExerciseInWorkout> = this.exercisesArray.at(index);
    this.exercisesArray.removeAt(index);
    this.exercisesArray.insert((index - 1), exerciseControl);
    //this.exercisesArray[index - 1].controls.sequnce
  }

  public moveExerciseDown(index: number): void {
    //Called by button click in template
    let exerciseControl: FormGroup<IExerciseInWorkout> = this.exercisesArray.at(index);
    this.exercisesArray.removeAt(index);
    this.exercisesArray.insert((index + 1), exerciseControl);
  }

  public saveWorkout(): void {
    //Called by Save button
    
    if (!this.workoutForm.invalid) {
      this.updateWorkoutFromFormValues();

      this.saving = true;
      this.infoMsg = "Saving...";

      if (this._workout.id == 0)
        this.addWorkout();
      else
        this.updateWorkout();

    }
  }

  private addWorkout(): void {
    console.log("ADDING WORKOUT: ", this._workout);
    this._workoutService.add(this._workout)
      .pipe(finalize(() => {
          this.saving = false;
      }))
      .subscribe((addedWorkout: Workout) => {
          //this.workout = value;
          this.workoutId = addedWorkout.id;
          this.infoMsg = "Workout created at " + new Date().toLocaleTimeString();
      },
      (error: any) => {
          this.errorMsg = error.message;
          this.infoMsg = null;
      }
    );
  
  }

  private updateWorkout(): void {
    console.log("UPDATING WORKOUT: ", this._workout);
    this._workoutService.update(this._workout)
      .pipe(finalize(() => {
          this.saving = false;
      }))
      .subscribe((updatedWorkout: Workout) => {
          this.saving = false;
          this.infoMsg = "Workout updated at " + new Date().toLocaleTimeString();
      }, 
      (error: any) => {
          console.log("ERROR: ", error);
          this.errorMsg = error.message;
          this.infoMsg = null;
      }
    );

  }

  private createExerciseFormGroup(
    exerciseInWorkoutId: number, 
    exerciseId: number, 
    exerciseName: string, 
    setType: number = 0, 
    numberOfSets: number = 0): FormGroup<IExerciseInWorkout> {
      
    //console.log("getExerciseFormGroup: exerciseInWorkoutId = " + exerciseInWorkoutId + ", exerciseId = " + exerciseId + ", exerciseName = " + exerciseName + ", setType = " + setType + ", numberOfSets = " + numberOfSets);
    return this._formBuilder.group<IExerciseInWorkout>({
      id: new FormControl<number>(exerciseInWorkoutId, { nonNullable: true }), 
      exerciseId: new FormControl<number>(exerciseId, { nonNullable: true }),  
      exerciseName: new FormControl<string>(exerciseName, { nonNullable: true, validators: Validators.compose([Validators.required])}),
      numberOfSets: new FormControl<number>(numberOfSets, { nonNullable: true, validators: Validators.compose([Validators.required, Validators.min(1)])}), 
      setType: new FormControl<number>(setType, { nonNullable: true, validators: Validators.compose([Validators.required])})
    });
  }

  private updateWorkoutFromFormValues(): void {
    if (this.workoutForm) {
      console.log("this._workout: ", this._workout);
      this._workout.name = this.workoutForm.controls.name.value;
      this._workout.exercises = this.getExercisesFromForm();
    }
  }

  private getExercisesFromForm(): Array<ExerciseInWorkout> {
    let output = new Array<ExerciseInWorkout>();
    let index = 0;

    for (let exerciseFormGroup of this.exercisesArray.controls) {
      output.push(
        new ExerciseInWorkout(
          exerciseFormGroup.controls.id.value,
          exerciseFormGroup.controls.exerciseId.value, 
          exerciseFormGroup.controls.exerciseName.value, 
          exerciseFormGroup.controls.numberOfSets.value, 
          exerciseFormGroup.controls.setType.value,
          index) 
      );
      index++;
    }

    return output;
  }
}
