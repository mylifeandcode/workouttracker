import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/users/user.service';
import { Workout } from 'app/models/workout';
import { User } from 'app/models/user';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-workout-edit',
  templateUrl: './workout-edit.component.html',
  styleUrls: ['./workout-edit.component.css']
})
export class WorkoutEditComponent implements OnInit {

  private _workoutId: number = 0;
  public workout: Workout;
  public workoutForm: FormGroup;

  private _saving: boolean = false;
  private _loading: boolean = true;
  private _errorMsg: string = null;
  private _currentUserId: number; //The ID of the user performing the add or edit
  private _modalRef: BsModalRef;
  public infoMsg: string = null;

  constructor(
    private route: ActivatedRoute,
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
      else {
        this.workout = new Workout();
        this._loading = false;
      }
  }

  private openModal(template: TemplateRef<any>): void {
    this._modalRef = this._modalSvc.show(template);
  }

  private getRouteParams(): void {
    this.route.params.subscribe(params => {
        this._workoutId = params['id'];
    });
  }

  private createForm(): void {

    this.workoutForm = this._formBuilder.group({
        id: [0, Validators.required ], 
        name: ['', Validators.required]
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
    this._workoutSvc.getById(this._workoutId).subscribe((value: Workout) => {
        this.workout = value;
        this.updateFormWithWorkoutValues();
        this._loading = false;
    }); //TODO: Handle errors
  }

  private updateFormWithWorkoutValues(): void {

  }

}
