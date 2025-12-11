import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators, FormControl, FormGroup, FormArray, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkoutService } from '../_services/workout.service';
import { Workout } from 'app/workouts/_models/workout';
import { ExerciseDTO } from 'app/workouts/_models/exercise-dto';
import { ExerciseInWorkout } from '../_models/exercise-in-workout';
import { finalize } from 'rxjs/operators';
import { CheckForUnsavedDataComponent } from 'app/shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgClass } from '@angular/common';
import { SelectOnFocusDirective } from '../../shared/directives/select-on-focus.directive';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ExerciseListMiniComponent } from '../../exercises/exercise-list-mini/exercise-list-mini.component';
import { EMPTY_GUID } from 'app/shared/shared-constants';
import { HttpErrorResponse } from '@angular/common/http';

interface IExerciseInWorkout {
  id: FormControl<number>;
  exerciseId: FormControl<number>;
  exerciseName: FormControl<string>;
  numberOfSets: FormControl<number>;
  setType: FormControl<number>;
}

interface IWorkoutEditForm {
  id: FormControl<number>;
  publicId: FormControl<string>; //Will be EMPTY_GUID for a new Workout
  active: FormControl<boolean>;
  name: FormControl<string>;
  exercises: FormArray<FormGroup<IExerciseInWorkout>>;
}

@Component({
  selector: 'wt-workout-edit',
  templateUrl: './workout-edit.component.html',
  styleUrls: ['./workout-edit.component.scss'],
  imports: [
    NzSpinModule, FormsModule, ReactiveFormsModule, NgClass,
    SelectOnFocusDirective, NzSwitchModule, NzModalModule, ExerciseListMiniComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutEditComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _formBuilder = inject(FormBuilder);
  private _workoutService = inject(WorkoutService);
  private _router = inject(Router);

  // Constants
  private static readonly DEFAULT_SET_TYPE = 0;
  private static readonly DEFAULT_NUMBER_OF_SETS = 0;
  private static readonly MIN_SETS = 1;


  //A helfpul link for dynamic form arrays: https://codinglatte.com/posts/angular/angular-dynamic-form-fields-using-formarray/

  public id = input<string | undefined>(undefined);

  //PUBLIC FIELDS
  public workoutForm: FormGroup<IWorkoutEditForm>;
  public loading = signal<boolean>(true);
  public infoMsg = signal<string | null>(null);
  public showExerciseSelectModal = signal<boolean>(false);

  public fromViewRoute = signal<boolean>(false);
  public errorMsg = signal<string | null>(null);
  public saving = signal<boolean>(false);

  protected editEnabled = signal(false);

  //PRIVATE FIELDS
  private _workout: Workout = new Workout();

  //PROPERTIES
  get exercisesArray(): FormArray<FormGroup<IExerciseInWorkout>> {
    return this.workoutForm.controls.exercises;
  }

  constructor() {
    super();
    this.workoutForm = this.createForm();
  }

  public ngOnInit(): void {
    this.fromViewRoute.set(this._route.snapshot.url.join('').indexOf('view') > -1);

    if (!this.fromViewRoute()) {
      this.editEnabled.set(true);
    }
      
    this.setupForm();
  }

  public openModal(): void {
    this.showExerciseSelectModal.set(true);
  }

  public closeModal(): void {
    this.showExerciseSelectModal.set(false);
  }

  public hasUnsavedData(): boolean {
    return this.workoutForm.dirty;
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
    const exerciseControl: FormGroup<IExerciseInWorkout> = this.exercisesArray.at(index);
    this.exercisesArray.removeAt(index);
    this.exercisesArray.insert((index - 1), exerciseControl);
    //this.exercisesArray[index - 1].controls.sequnce
  }

  public moveExerciseDown(index: number): void {
    //Called by button click in template
    const exerciseControl: FormGroup<IExerciseInWorkout> = this.exercisesArray.at(index);
    this.exercisesArray.removeAt(index);
    this.exercisesArray.insert((index + 1), exerciseControl);
  }

  public saveWorkout(): void {
    //Called by Save button

    if (!this.workoutForm.invalid) {
      this.updateWorkoutFromFormValues();

      this.saving.set(true);
      this.infoMsg.set("Saving...");

      if (!this._workout.publicId)
        this.addWorkout();
      else
        this.updateWorkout();

    }
  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////////////////////////

  private setupForm(): void {
    if (this.id() !== undefined) {
      this.loadWorkout();
    }
    else {
      this._workout = new Workout();
      this.loading.set(false);
    }
  }

  private createForm(): FormGroup<IWorkoutEditForm> {

    return this._formBuilder.group<IWorkoutEditForm>({
      id: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      publicId: new FormControl<string>(EMPTY_GUID, { nonNullable: true, validators: Validators.required }),
      active: new FormControl<boolean>(true, { nonNullable: true, validators: Validators.required }),
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      exercises: new FormArray<FormGroup<IExerciseInWorkout>>([])
    });

  }

  private loadWorkout(): void {
    const workoutId = this.id();
    if (!workoutId) return;

    this.loading.set(true);
    this._workoutService.getById(workoutId)
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe({
        next: (workout: Workout) => {
          this.updateFormWithWorkoutValues(workout);
          this._workout = workout;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMsg.set(error.message || 'An error occurred loading the workout.');
          console.error('Error loading workout:', error);
        }
      });
  }

  private updateFormWithWorkoutValues(workout: Workout): void {
    this.workoutForm.patchValue({
      id: workout.id,
      publicId: workout.publicId ?? undefined,
      active: workout.active,
      name: workout.name
    });

    workout.exercises.forEach(exerciseInWorkout => {
      if (exerciseInWorkout && exerciseInWorkout?.exercise?.name) {
        this.exercisesArray.push(
          this.createExerciseFormGroup(
            exerciseInWorkout.id,
            exerciseInWorkout.exerciseId,
            exerciseInWorkout?.exercise?.name,
            exerciseInWorkout.setType,
            exerciseInWorkout.numberOfSets
          )
        );
      }
    });
  }

  private addWorkout(): void {
    //console.log("ADDING WORKOUT: ", this._workout);
    this._workout.publicId = EMPTY_GUID;
    this._workoutService.add(this._workout)
      .pipe(finalize(() => {
        this.saving.set(false);
        this.workoutForm.markAsPristine();
      }))
      .subscribe({
        next: (addedWorkout: Workout) => {
          //this.workout = value;
          //this.workoutId = addedWorkout.publicId ?? undefined; //Should NEVER be undefined
          //this._workout = addedWorkout; //TODO: Refactor! We have redundant variables!
          //this.infoMsg = "Workout created at " + new Date().toLocaleTimeString();
          this._router.navigate([`workouts/edit/${addedWorkout.publicId}`]);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMsg.set(error.message);
          this.infoMsg.set(null);
        }
      });
  }

  private updateWorkout(): void {
    //console.log("UPDATING WORKOUT: ", this._workout);
    this._workoutService.update(this._workout)
      .pipe(finalize(() => {
        this.saving.set(false);
        this.workoutForm.markAsPristine();
      }))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.infoMsg.set("Workout updated at " + new Date().toLocaleTimeString());
        },
        error: (error: HttpErrorResponse) => {
          this.errorMsg.set(error.message);
          this.infoMsg.set(null);
        }
      });

  }

  private createExerciseFormGroup(
    exerciseInWorkoutId: number,
    exerciseId: number,
    exerciseName: string,
    setType: number = WorkoutEditComponent.DEFAULT_SET_TYPE,
    numberOfSets: number = WorkoutEditComponent.DEFAULT_NUMBER_OF_SETS): FormGroup<IExerciseInWorkout> {

    return this._formBuilder.group<IExerciseInWorkout>({
      id: new FormControl<number>(exerciseInWorkoutId, { nonNullable: true }),
      exerciseId: new FormControl<number>(exerciseId, { nonNullable: true }),

      exerciseName: new FormControl<string>(
        exerciseName, { nonNullable: true, validators: Validators.compose([Validators.required]) }),

      numberOfSets: new FormControl<number>(
        numberOfSets, {
        nonNullable: true,
        validators: Validators.compose([Validators.required, Validators.min(WorkoutEditComponent.MIN_SETS)])
      }),

      setType: new FormControl<number>(setType, { nonNullable: true, validators: Validators.compose([Validators.required]) })
    });
  }

  private updateWorkoutFromFormValues(): void {
    if (this.workoutForm) {
      //console.log("this._workout: ", this._workout);
      this._workout.name = this.workoutForm.controls.name.value;
      this._workout.exercises = this.getExercisesFromForm();
    }
  }

  private getExercisesFromForm(): Array<ExerciseInWorkout> {
    const output = new Array<ExerciseInWorkout>();
    let index = 0;

    for (const exerciseFormGroup of this.exercisesArray.controls) {
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
