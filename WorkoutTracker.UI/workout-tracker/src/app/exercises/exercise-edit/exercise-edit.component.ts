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

    private _exerciseId: number = 0;
    private _saving: boolean = false;
    private _loading: boolean = false;
    private _errorMsg: string = null;
    private _currentUserId: number; //The ID of the user performing the add or edit
    public allTargetAreas: TargetArea[];

    async ngOnInit() {
        this.getRouteParams();

        let targetAreasFormArray = await this.setupTargetAreas();
        this.createForm(targetAreasFormArray);
        
        console.log("FORM: ", this.exerciseForm);

        if (this._exerciseId != 0)
            this.loadExercise(); //Is this safe? route.params is an observable.

        //TODO: Wrap the below two calls in a Promise.all()
        this._currentUserId = await this.getCurrentUserId();
    }

    private async getCurrentUserId(): Promise<number> {
        //TODO: Create edit form base component that would contain this function and be extended by other
        //edit components
        let result: User = await this._userSvc.getCurrentUserInfo().toPromise();
        return result ? result.id : 0;
    }

    private async setupTargetAreas(): Promise<FormArray> {
        //Get a list of all of the target areas.
        //Then, create checkboxes for each one on the form.
        //If any of the target areas are already selected, set them as selected on the form.

        this.allTargetAreas = await this.getAllTargetAreas();
        //TODO: Get selected target area IDs
        var targetAreasFormArray = this.buildTargetAreasFormArray(this.allTargetAreas, []);
        console.log("targetAreasFormArray: ", targetAreasFormArray);
        return targetAreasFormArray;
    }

    private async getAllTargetAreas(): Promise<TargetArea[]> {
        //TODO: Refactor! Create an Exercise DTO that has an array of TargetArea IDs. Let the service on the
        //server sort it out.
        let result: TargetArea[] = await this._exerciseSvc.getTargetAreas().toPromise();
        return result ? result : null;
    }

    private getRouteParams(): void {
        this.route.params.subscribe(params => {
            this._exerciseId = params['id'];
            console.log('Exercise ID = ', this._exerciseId);
        });
    }
    
    private createForm(targetAreasFormArray: FormArray): void {
        console.log("Creating form...");

        //Use FormBuilder to create our root FormGroup
        this.exerciseForm = this._formBuilder.group({
            id: [0, Validators.required ], //TODO: Get ID from URL. 0 for new, actual ID for existing exercise.
            name: ['', Validators.required], 
            description: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])], 
            targetAreas: targetAreasFormArray
        });

        console.log("exerciseForm.targetAreas: ", this.exerciseForm.controls["targetAreas"]);
    }

    private buildTargetAreasFormArray(allTargetAreas: TargetArea[], selectedTargetAreaIds: number[]): FormArray {
        //Great approach I found at:
        //https://coryrylan.com/blog/creating-a-dynamic-checkbox-list-in-angular
        //Also:
        //https://netbasal.com/handling-multiple-checkboxes-in-angular-forms-57eb8e846d21

        const arr = allTargetAreas.map(area => new FormControl(false));

        //FormArray can only take a single validator, not an array.
        //Use the below as a workaround as shown at https://github.com/angular/angular/issues/12763
        return this._formBuilder.array(
            //arr, Validators.compose([Validators.required, Validators.minLength(1)]));
            //But in this case, we need a custom validator
            arr, CustomValidators.multipleCheckboxRequireOne);
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
        exercise.description = this.exerciseForm.get("description").value;
        exercise.name = this.exerciseForm.get("name").value;

        if (exercise.id > 0)
            exercise.modifiedByUserId = this._currentUserId;
        else
            exercise.createdByUserId = this._currentUserId;

        exercise.exerciseTargetAreaLinks = this.getExerciseTargetAreaLinksForPersist();

        return exercise;
    }

    private getExerciseTargetAreaLinksForPersist(): ExerciseTargetAreaLink[] {
        //Great approach I found at:
        //https://coryrylan.com/blog/creating-a-dynamic-checkbox-list-in-angular

        var output: ExerciseTargetAreaLink[] = [];

        var selected: number[] = this.exerciseForm.value.targetAreas
            .map((v, i) => v ? this.allTargetAreas[i].id : null)
            .filter(v => v !== null);

        selected.forEach(id => {
            output.push(new ExerciseTargetAreaLink(
                this._exerciseId, 
                id, 
                this._currentUserId
            ))
        });

        return output;
    }

    private updateFormWithExerciseValues(): void {
        this.exerciseForm.patchValue ({
            id: this.exercise.id,
            name: this.exercise.name, 
            description: this.exercise.description
        });

        if (this.exercise.exerciseTargetAreaLinks) {
            this.exercise.exerciseTargetAreaLinks.forEach((link: ExerciseTargetAreaLink) => {
                let controlIndex = _.findIndex((this.exerciseForm.value.targetAreas, {id: link.targetAreaId}));
                this.exerciseForm.value.targetAreas.at(controlIndex).patchValue(true);
            });
        }
    }

    private saveExercise(): void {
        var exercise = this.getExerciseForPersist();

        if (this._exerciseId == 0)
            this._exerciseSvc.add(exercise).subscribe(
                (value: Exercise) => {
                    //this._saving = false;
                },
                (error: any) => {
                    console.log("ERROR: ", error);
                    this._errorMsg = error.toString();
                },
                () => {
                    this._saving = false;
                }
            );
        else
            this._exerciseSvc.update(exercise).subscribe((value: Exercise) => {
                this._saving = false;
            });
    }

}
