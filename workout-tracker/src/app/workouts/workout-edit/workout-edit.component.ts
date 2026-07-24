import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormField, required, min, readonly, applyEach } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../_services/workout.service';
import { finalize } from 'rxjs/operators';
import { CheckForUnsavedDataComponent } from '../../shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { SelectOnFocusDirective } from '../../shared/directives/select-on-focus.directive';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ExerciseListMiniComponent } from '../../exercises/exercise-list-mini/exercise-list-mini.component';
import { EMPTY_GUID } from '../../shared/constants/feature-agnostic-constants';
import { HttpErrorResponse } from '@angular/common/http';
import { ExerciseDTO, ExerciseInWorkout, SetType, Workout } from '../../api';

interface IExerciseInWorkoutModel {
  id: number;
  exerciseId: number;
  exerciseName: string;
  numberOfSets: number;
  setType: string; //'0'|'1' — native <select> value; converted to the numeric SetType at persist
}

interface IWorkoutEditModel {
  id: number;
  publicId: string; //Will be EMPTY_GUID for a new Workout
  active: boolean;
  name: string;
  exercises: IExerciseInWorkoutModel[];
}

@Component({
  selector: 'wt-workout-edit',
  templateUrl: './workout-edit.component.html',
  styleUrls: ['./workout-edit.component.scss'],
  imports: [
    NzSpinModule, FormsModule, FormField,
    SelectOnFocusDirective, NzSwitchModule, NzModalModule, ExerciseListMiniComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutEditComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _workoutService = inject(WorkoutService);
  private _router = inject(Router);

  // Constants
  private static readonly DEFAULT_SET_TYPE = '0';
  private static readonly DEFAULT_NUMBER_OF_SETS = 0;
  private static readonly MIN_SETS = 1;


  //A helfpul link for dynamic form arrays: https://codinglatte.com/posts/angular/angular-dynamic-form-fields-using-formarray/

  public id = input<string | undefined>(undefined);

  //PUBLIC FIELDS
  protected readonly model = signal<IWorkoutEditModel>(this.buildEmptyModel());
  public readonly workoutForm = form(this.model, (p) => {
    required(p.id);
    required(p.publicId);
    required(p.name);
    applyEach(p.exercises, (ex) => {
      required(ex.exerciseName);
      readonly(ex.exerciseName); //Name is chosen via the exercise-select modal, never typed
      required(ex.numberOfSets);
      min(ex.numberOfSets, WorkoutEditComponent.MIN_SETS);
      required(ex.setType);
    });
  });

  public loading = signal<boolean>(true);
  public infoMsg = signal<string | null>(null);
  public showExerciseSelectModal = signal<boolean>(false);

  public fromViewRoute = signal<boolean>(false);
  public errorMsg = signal<string | null>(null);
  public saving = signal<boolean>(false);

  protected editEnabled = signal(false);

  //PRIVATE FIELDS
  private _workout: Workout = <Workout>{};

  constructor() {
    super();
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
    return this.workoutForm().dirty();
  }

  public addExercise(exercise: ExerciseDTO): void {
    this.model.update(m => ({
      ...m,
      exercises: [...m.exercises, this.createExerciseModel(0, exercise.id, exercise.name)]
    }));
  }

  public removeExercise(index: number): void {
    //Called by button click in template
    this.model.update(m => ({
      ...m,
      exercises: m.exercises.filter((_, i) => i !== index)
    }));
  }

  public moveExerciseUp(index: number): void {
    //Called by button click in template
    if (index <= 0) return;
    this.swapExercises(index, index - 1);
  }

  public moveExerciseDown(index: number): void {
    //Called by button click in template
    this.model.update(m => {
      if (index >= m.exercises.length - 1) return m;
      const exercises = [...m.exercises];
      [exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]];
      return { ...m, exercises };
    });
  }

  public saveWorkout(): void {
    //Called by Save button

    if (!this.workoutForm().invalid()) {
      this.updateWorkoutFromFormValues();

      this.saving.set(true);
      this.infoMsg.set("Saving...");

      console.log('Workout to save:', this._workout);

      if (!this._workout.publicId)
        this.addWorkout();
      else
        this.updateWorkout();

    }/*
    else {
      Object.keys(this.workoutForm.controls).forEach(key => {
        const control = this.workoutForm.get(key);
        if (control?.invalid) {
          console.log('Invalid control:', key, control.errors);
        }
      });
    }*/

  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////////////////////////

  private setupForm(): void {
    if (this.id() !== undefined) {
      this.loadWorkout();
    }
    else {
      this._workout = <Workout>{};
      this._workout.active = true;
      this.loading.set(false);
    }
  }

  private buildEmptyModel(): IWorkoutEditModel {
    return {
      id: 0,
      publicId: EMPTY_GUID,
      active: true,
      name: '',
      exercises: []
    };
  }

  private loadWorkout(): void {
    const workoutId = this.id();
    if (!workoutId) return;

    this.loading.set(true);
    this._workoutService.getById(workoutId)
      .pipe(finalize(() => { this.loading.set(false); }))
      .subscribe({
        next: (workout: Workout) => {
          this.model.set(this.buildModel(workout));
          this._workout = workout;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMsg.set(error.message || 'An error occurred loading the workout.');
        }
      });
  }

  private buildModel(workout: Workout): IWorkoutEditModel {
    return {
      id: workout.id,
      publicId: workout.publicId ?? EMPTY_GUID,
      active: workout.active,
      name: workout.name ?? '',
      exercises: (workout.exercises ?? [])
        .filter(exerciseInWorkout => exerciseInWorkout?.exercise?.name)
        .map(exerciseInWorkout => this.createExerciseModel(
          exerciseInWorkout.id,
          exerciseInWorkout.exerciseId,
          exerciseInWorkout.exercise!.name,
          String(exerciseInWorkout.setType),
          exerciseInWorkout.numberOfSets
        ))
    };
  }

  private addWorkout(): void {
    this._workout.publicId = EMPTY_GUID;
    this._workoutService.add(this._workout)
      .pipe(finalize(() => {
        this.saving.set(false);
        this.workoutForm().reset();
      }))
      .subscribe({
        next: (addedWorkout: Workout) => {
          this._router.navigate([`workouts/edit/${addedWorkout.publicId}`]);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMsg.set(error.message);
          this.infoMsg.set(null);
        }
      });
  }

  private updateWorkout(): void {
    this._workoutService.update(this._workout)
      .pipe(finalize(() => {
        this.saving.set(false);
        this.workoutForm().reset();
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

  private createExerciseModel(
    exerciseInWorkoutId: number,
    exerciseId: number,
    exerciseName: string,
    setType: string = WorkoutEditComponent.DEFAULT_SET_TYPE,
    numberOfSets: number = WorkoutEditComponent.DEFAULT_NUMBER_OF_SETS): IExerciseInWorkoutModel {

    return {
      id: exerciseInWorkoutId,
      exerciseId,
      exerciseName,
      numberOfSets,
      setType
    };
  }

  private swapExercises(a: number, b: number): void {
    this.model.update(m => {
      const exercises = [...m.exercises];
      [exercises[a], exercises[b]] = [exercises[b], exercises[a]];
      return { ...m, exercises };
    });
  }

  private updateWorkoutFromFormValues(): void {
    this._workout.name = this.model().name;
    this._workout.exercises = this.getExercisesFromForm();
  }

  private getExercisesFromForm(): Array<ExerciseInWorkout> {
    return this.model().exercises.map((exercise: IExerciseInWorkoutModel, index: number) => (
      <ExerciseInWorkout>{
        id: exercise.id,
        createdByUserId: 0, //TODO: Update domain object. This value is never used had been defaulting to 0.
        createdDateTime: new Date(), //TODO: Update domain object. This value is never used and had been defaulting to DateTime.Min.
        exercise: null,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        numberOfSets: exercise.numberOfSets,
        sequence: index,
        setType: Number(exercise.setType) as SetType
      }
    ));
  }
}
