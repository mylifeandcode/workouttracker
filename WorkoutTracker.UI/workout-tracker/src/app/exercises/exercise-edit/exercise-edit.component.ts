import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../../models/exercise';
import { TargetArea } from '../../models/target-area';
import { CustomValidators } from '../../validators/custom-validators';
import { User } from 'app/models/user';
import { UserService } from 'app/users/user.service';
import { ExerciseTargetAreaLink } from '../../models/exercise-target-area-link';
import * as _ from 'lodash';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.css']
})
export class ExerciseEditComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _exerciseSvc: ExerciseService,
        private _userSvc: UserService) {
    }

    //public targetAreas: Array<TargetArea> = [];
    public exercise: Exercise;
    public exerciseForm: FormGroup;

    private _exerciseId: number = 0; //TODO: Refactor. We have an exercise variable. Why have this too?
    private _saving: boolean = false;
    private _loading: boolean = true;
    private _errorMsg: string = null;
    private _currentUserId: number; //The ID of the user performing the add or edit
    public allTargetAreas: TargetArea[];
    public infoMsg: string = null;

    async ngOnInit() {
        this.getRouteParams();
        this.createForm();

        //TODO: Wrap the below two calls in a Promise.all()
        this._currentUserId = await this.getCurrentUserId();
        this.allTargetAreas = await this._exerciseSvc.getTargetAreas().toPromise();

        if (this._exerciseId != 0) 
            this.loadExercise(); //Is this safe? route.params is an observable.
        else {
            this.setupTargetAreas([]);
            this._loading = false;
        }
    }

    private async getCurrentUserId(): Promise<number> {
        //TODO: Create edit form base component that would contain this function and be extended by other
        //edit components
        let result: User = await this._userSvc.getCurrentUserInfo().toPromise();
        return result ? result.id : 0;
    }

    private setupTargetAreas(exerciseTargetAreaLinks: ExerciseTargetAreaLink[]): void {
        //https://stackoverflow.com/questions/40927167/angular-reactiveforms-producing-an-array-of-checkbox-values

        const checkboxes = <FormGroup>this.exerciseForm.get('targetAreas');

        //I wanted to set the value of each checkbox to the ID of the target area, which was fine 
        //initially, but on toggling Angular set the value to a boolean.

        this.allTargetAreas.forEach((targetArea: TargetArea) => {
            checkboxes.addControl(targetArea.name, new FormControl(_.some(exerciseTargetAreaLinks, (link: ExerciseTargetAreaLink) => link.targetAreaId == targetArea.id)));
        });

        checkboxes.setValidators(CustomValidators.formGroupOfBooleansRequireOneTrue);
    }

    private getRouteParams(): void {
        this.route.params.subscribe(params => {
            this._exerciseId = params['id'];
        });
    }
    
    private createForm(): void {

        this.exerciseForm = this._formBuilder.group({
            id: [0, Validators.required ], //TODO: Get ID from URL. 0 for new, actual ID for existing exercise.
            name: ['', Validators.required], 
            description: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])], 
            targetAreas: this._formBuilder.group({}, CustomValidators.formGroupOfBooleansRequireOneTrue),
            setup: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])],
            movement: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])],
            pointsToRemember: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])]
        });

    }

    private loadExercise(): void {
        this._loading = true;
        this._exerciseSvc.getById(this._exerciseId).subscribe((value: Exercise) => {
            this.exercise = value;
            this.updateFormWithExerciseValues();
            this._loading = false;
        }); //TODO: Handle errors
    }

    private getExerciseForPersist(): Exercise {
        let exercise = new Exercise();

        exercise.id = this.exerciseForm.get("id").value;
        exercise.name = this.exerciseForm.get("name").value;
        exercise.description = this.exerciseForm.get("description").value;
        exercise.setup = this.exerciseForm.get("setup").value;
        exercise.movement = this.exerciseForm.get("movement").value;
        exercise.pointsToRemember = this.exerciseForm.get("pointsToRemember").value;

        if (exercise.id > 0)
            exercise.modifiedByUserId = this._currentUserId;
        else
            exercise.createdByUserId = this._currentUserId;

        exercise.exerciseTargetAreaLinks = this.getExerciseTargetAreaLinksForPersist();

        return exercise;
    }

    private getExerciseTargetAreaLinksForPersist(): ExerciseTargetAreaLink[] {
        //Original approach using FormArray found at:
        //https://coryrylan.com/blog/creating-a-dynamic-checkbox-list-in-angular
        //My approach differs due to different control creation from approach learned at:
        //https://stackoverflow.com/questions/40927167/angular-reactiveforms-producing-an-array-of-checkbox-values

        var output: ExerciseTargetAreaLink[] = [];

        for(var key in this.exerciseForm.value.targetAreas) {
            if (this.exerciseForm.value.targetAreas[key]) {
                let selectedTargetArea = _.find(this.allTargetAreas, (targetArea: TargetArea) => targetArea.name == key); 
                output.push(new ExerciseTargetAreaLink(
                    this._exerciseId, 
                    selectedTargetArea.id, 
                    this._currentUserId
                ));
            }
        }

        return output;
    }

    private updateFormWithExerciseValues(): void {
        this.exerciseForm.patchValue ({
            id: this.exercise.id,
            name: this.exercise.name, 
            description: this.exercise.description,
            setup: this.exercise.setup,
            movement: this.exercise.movement,
            pointsToRemember: this.exercise.pointsToRemember
        });

        if (this.exercise.exerciseTargetAreaLinks) {
            this.setupTargetAreas(this.exercise.exerciseTargetAreaLinks);
        }
    }

    private saveExercise(): void {
        //Called by Save button
        this._saving = true;
        this.infoMsg = "Saving...";
        var exercise = this.getExerciseForPersist();

        if (this._exerciseId == 0)
            this._exerciseSvc.add(exercise)
                .pipe(finalize(() => {
                    this._saving = false;
                }))
                .subscribe((value: Exercise) => {
                    this.exercise = value;
                    this._exerciseId = this.exercise.id;
                    this.infoMsg = "Exercise created at " + new Date().toLocaleTimeString();
                },
                (error: any) => {
                    this._errorMsg = error.message;
                }
            );
        else
            this._exerciseSvc.update(exercise)
                .pipe(finalize(() => {
                    this._saving = false;
                }))
                .subscribe((value: Exercise) => {
                    this._saving = false;
                    this.infoMsg = "Exercise updated at " + new Date().toLocaleTimeString();
                }, 
                (error: any) => {
                    this._errorMsg = error.message;
                }
            );
    }

}
