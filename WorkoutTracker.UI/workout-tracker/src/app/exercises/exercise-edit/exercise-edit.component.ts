import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../../models/exercise';
import { TargetArea } from '../../models/target-area';
import { CustomValidators } from '../../validators/custom-validators';
import { User } from 'app/models/user';
import { UserService } from 'app/users/user.service';

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

    public targetAreas: Array<TargetArea> = [];
    public exercise: Exercise;
    public exerciseForm: FormGroup;

    private _exerciseId: number = 0;
    private _saving: boolean = false;
    private _loading: boolean = false;
    private _errorMsg: string = null;
    private _currentUserId: number; //The ID of the user performing the add or edit
    private _allTargetAreas: TargetArea[];

    async ngOnInit() {
        this.getRouteParams();
        if (this._exerciseId != 0)
            this.loadExercise(); //Is this safe? route.params is an observable.

        //TODO: Wrap the below two calls in a Promise.all()
        this._currentUserId = await this.getCurrentUserId();
        this._allTargetAreas = await this.getTargetAreas();
        console.log("TARGET AREAS: ", this._allTargetAreas);
        this.setupViewModel();
        this.createForm();
    }

    private async getCurrentUserId(): Promise<number> {
        //TODO: Create edit form base component that would contain this function and be extended by other
        //edit components
        let result: User = await this._userSvc.getCurrentUserInfo().toPromise();
        return result ? result.id : 0;
    }

    private async getTargetAreas(): Promise<TargetArea[]> {
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
    
    private setupViewModel(): void {
        //TODO: Merge available target areas with selected target areas
        console.log("Setting up view model...");
        this._allTargetAreas.forEach((value: TargetArea, index: number) => {
            console.log("value: ", value);
            this.targetAreas.push(new TargetArea(value.id, value.name, null, null, null, null, false));
        });
    }

    private createForm(): void {
        console.log("Creating form...");

        //Use FormBuilder to create our root FormGroup
        this.exerciseForm = this._formBuilder.group({
            id: [0, Validators.required ], //TODO: Get ID from URL. 0 for new, actual ID for existing exercise.
            name: ['', Validators.required], 
            description: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])], 
            targetAreas: this.buildTargetAreas()
        });

        let checkboxes = new Array<FormControl>(this.targetAreas.length);
    }

    private buildTargetAreas(): FormArray {
        //Great approach I found at:
        //https://netbasal.com/handling-multiple-checkboxes-in-angular-forms-57eb8e846d21
        const arr = this.targetAreas.map(area => {
            console.log("area:", area);
            return this._formBuilder.control(area.selected);
        });

        //FormArray can only take a single validator, not an array.
        //Use the below as a workaround as shown at https://github.com/angular/angular/issues/12763
        return this._formBuilder.array(
            //arr, Validators.compose([Validators.required, Validators.minLength(1)]));
            //But in this case, we need a custom validator
            arr, CustomValidators.multipleCheckboxRequireOne);
    }

    private get allTargetAreas(): AbstractControl {
        return this.exerciseForm.get('targetAreas');
    };

    private loadExercise(): void {
        this._loading = true;
        this._exerciseSvc.getById(this._exerciseId).subscribe((value: Exercise) => {
            this.exercise = value;
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

        return exercise;
    }

    private saveExercise(): void {
        if (this._exerciseId == 0)
            this._exerciseSvc.add(this.exercise).subscribe(
                (value: Exercise) => {
                    //this._saving = false;
                },
                (error: any) => {
                    this._errorMsg = error.toString();
                },
                () => {
                    this._saving = false;
                }
            );
        else
            this._exerciseSvc.update(this.exercise).subscribe((value: Exercise) => {
                this._saving = false;
            });
    }

}
