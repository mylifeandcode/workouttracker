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
        if (this._exerciseId != 0)
            this.loadExercise(); //Is this safe? route.params is an observable.

        //TODO: Wrap the below two calls in a Promise.all()
        this._currentUserId = await this.getCurrentUserId();
        var targetAreasFormArray = await this.setupTargetAreas();
        this.createForm(targetAreasFormArray);
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
    
    private setupViewModel(): void {
        //TODO: Merge available target areas with selected target areas
        console.log("Setting up view model...");
        /*
        this.allTargetAreas.forEach((value: TargetArea, index: number) => {
            console.log("value: ", value);
            this.targetAreas.push(new TargetArea(value.id, value.name, null, null, null, null, false));
        });
        */
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
        //https://netbasal.com/handling-multiple-checkboxes-in-angular-forms-57eb8e846d21
        const arr = allTargetAreas.map(area => {
            console.log("area:", area);
            return this._formBuilder.control(_.some(selectedTargetAreaIds, area.id));
        });

        //FormArray can only take a single validator, not an array.
        //Use the below as a workaround as shown at https://github.com/angular/angular/issues/12763
        return this._formBuilder.array(
            //arr, Validators.compose([Validators.required, Validators.minLength(1)]));
            //But in this case, we need a custom validator
            arr, CustomValidators.multipleCheckboxRequireOne);
    }
    /*
    private get allTargetAreas(): AbstractControl {
        return this.exerciseForm.get('targetAreas');
    };
    */
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

        exercise.exerciseTargetAreaLinks = this.getExerciseTargetAreaLinksForPersist();
        console.log("EXERCISE: ", exercise);
        console.log("TARGET AREAS: ", this.exerciseForm.get('targetAreas'));
        console.log("ALL TARGET AREAS: ", this.allTargetAreas);

        return exercise;
    }

    private getExerciseTargetAreaLinksForPersist(): ExerciseTargetAreaLink[] {
        //I hate this. There's gotta be a better way.
        //TODO: Refactor!
        var output: ExerciseTargetAreaLink[] = [];
        var formControls: FormArray = <FormArray>this.exerciseForm.get('targetAreas');

        for(var x = 0; x < this.allTargetAreas.length; x++) {
            if(formControls.controls[x].value) {
                output.push(
                    new ExerciseTargetAreaLink(
                        this._exerciseId, 
                        this.allTargetAreas[x].id, 
                        this._currentUserId));
            }
        }

        return output;
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

    onCheckboxChange(index: number): void {
        //From https://stackoverflow.com/questions/40927167/angular-2-reactive-forms-array-of-checkbox-values

        //We want to get back what the name of the checkbox represents, so I'm intercepting the event and
        //manually changing the value from true to the name of what is being checked.

        //check if the value is true first, if it is then change it to the name of the value
        //this way when it's set to false it will skip over this and make it false, thus unchecking
        //the box
        console.log(event);
        console.log(this.exerciseForm);
        //var selected = this.getSelectedTargetAreas();
        //console.log("SELECTED: ", selected);
        //var blah = this.exerciseForm.get(event.target.id);
        //console.log("BLAH: ", blah);
        //if (this.exerciseForm.get(event.target.id).value) {
            //this.exerciseForm.patchValue({ [event.target.id]: event.target.id }); //make sure to have the square brackets
        //}
    }
}
