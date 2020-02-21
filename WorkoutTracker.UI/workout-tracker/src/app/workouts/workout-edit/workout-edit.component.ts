import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/users/user.service';
import { Workout } from 'app/models/workout';
import { Set } from 'app/models/set';
import { User } from 'app/models/user';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ExerciseDTO } from 'app/models/exercise-dto';
import { WorkoutDTO } from 'app/models/workout-dto';
import { ExerciseInWorkout } from 'app/models/exercise-in-workout';

@Component({
  selector: 'app-workout-edit',
  templateUrl: './workout-edit.component.html',
  styleUrls: ['./workout-edit.component.css']
})
export class WorkoutEditComponent implements OnInit {

  //A helfpul link for dynamic form arrays: https://codinglatte.com/posts/angular/angular-dynamic-form-fields-using-formarray/

  private _workoutId: number;
  public workoutForm: FormGroup;

  private _saving: boolean = false;
  private _loading: boolean = true;
  private _errorMsg: string = null;
  private _currentUserId: number; //The ID of the user performing the add or edit
  private _modalRef: BsModalRef;
  public infoMsg: string = null;

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

    if (this._workoutId != 0) 
        this.loadWorkout(); //Is this safe? route.params is an observable.
    else
      this._loading = false;
  }

  private openModal(template: TemplateRef<any>): void {
    this._modalRef = this._modalSvc.show(template);
  }

  private getRouteParams(): void {
    this._route.params.subscribe(params => {
        this._workoutId = params['id'];
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
    this._loading = true;
    this._workoutSvc.getById(this._workoutId).subscribe((workout: Workout) => {
        this.updateFormWithWorkoutValues(workout);
        this._loading = false;
    }); //TODO: Handle errors
  }

  private updateFormWithWorkoutValues(workout: Workout): void {

  }

  private addExercise(exercise: ExerciseDTO): void {

    this._modalRef.hide();     //TODO: Check this out: https://valor-software.com/ngx-bootstrap/#/modals
    let exerciseInWorkout = new ExerciseInWorkout(exercise.id, exercise.name, 1); //TODO: Support selected SetType
    //this._workoutDTO.exercises.push();
    this.exercisesArray.push(this.createExercise(exerciseInWorkout));

  }

  private getWorkoutDTOFromWorkout(workout: Workout): WorkoutDTO {
    //TODO: Implement
    return null;
  }

  private saveWorkout(): void {

  }

  private createExercise(exercise: ExerciseInWorkout): FormGroup {
    return this._formBuilder.group({
      exerciseName: ['', Validators.compose([Validators.required])],
      numberOfSets: [0, Validators.compose([Validators.required])], 
      setType: ['', Validators.compose([Validators.required])]
    });
  }

  private getWorkoutForPersist(): Workout {
    let workout = new Workout();
    workout.id = this._workoutId;

    if (workout.id == 0) {
      workout.createdByUserId = this._currentUserId;
      workout.createdDateTime = new Date();
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
            exerciseGroup.get("exerciseName").value,
            exerciseGroup.get("setType").value));
      }
    }

    return output;
  }
}
