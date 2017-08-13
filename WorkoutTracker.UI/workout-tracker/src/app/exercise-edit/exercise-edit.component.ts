import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../exercise';
import { TargetArea } from '../target-area';
import { CustomValidators } from '../custom-validators';

@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.css']
})
export class ExerciseEditComponent implements OnInit {

    constructor(private route: ActivatedRoute, private _formBuilder: FormBuilder, private _exerciseSvc: ExerciseService) {
        console.log("Constructing ExerciseEditComponent...");
        //this.createForm();
    }

    public targetAreas: Array<TargetArea> = [];
    public exercise: Exercise;
    public exerciseForm: FormGroup;

    private _exerciseId: number = 0;
    private _saving: boolean = false;
    private _loading: boolean = false;

    ngOnInit(): void {
        this.getRouteParams();
        this.setupViewModel();
        this.createForm();
        if (this._exerciseId != 0)
            this.loadExercise(); //Is this safe? route.params is an observable.
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
        this.targetAreas.push(new TargetArea(1, "Abs", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(2, "Back", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(3, "Biceps", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(4, "Chest", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(5, "Core", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(6, "Legs", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(7, "Shoulders", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(8, "Triceps", null, null, null, null, false));
    }

    private createForm(): void {
        console.log("Creating form...");

        //Use FormBuilder to create our root FormGroup
        this.exerciseForm = this._formBuilder.group({
            id: [0, Validators.required ], //TODO: Get ID from URL. 0 for new, actual ID for existing exercise.
            name: ['', Validators.required], 
            description: ['', Validators.required], 
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

    private saveExercise(): void {
        if (this._exerciseId == 0)
            this._exerciseSvc.add(this.exercise).subscribe((value: Exercise) => {
                //TODO: Implement
                this._saving = false;
            });
        else
            this._exerciseSvc.update(this.exercise).subscribe((value: Exercise) => {
                //TODO: Implement
                this._saving = false;
            });
    }
}
