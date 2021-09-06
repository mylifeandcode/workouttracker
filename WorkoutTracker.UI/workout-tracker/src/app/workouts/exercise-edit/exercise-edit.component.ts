import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../../workouts/models/exercise';
import { TargetArea } from '../../workouts/models/target-area';
import { CustomValidators } from '../../validators/custom-validators';
import { User } from 'app/core/models/user';
import { UserService } from 'app/core/user.service';
import { ExerciseTargetAreaLink } from '../../workouts/models/exercise-target-area-link';
import * as _ from 'lodash';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.css']
})
export class ExerciseEditComponent implements OnInit {

    constructor(
        private _route: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _exerciseSvc: ExerciseService,
        private _userSvc: UserService) {
    }

    //public targetAreas: Array<TargetArea> = [];
    public exercise: Exercise;
    public exerciseForm: FormGroup;

    private _exerciseId: number = 0; //TODO: Refactor. We have an exercise variable. Why have this too?
    private _saving: boolean = false;
    public loading: boolean = true;
    private _errorMsg: string = null;
    public currentUserId: number; //The ID of the user performing the add or edit
    public allTargetAreas: TargetArea[];
    public resistanceTypes: Map<number, string>;
    public infoMsg: string = null;

    async ngOnInit() {

        this.createForm();

        //TODO: Revisit. Do we really need to await this stuff?
        this.currentUserId = await this.getCurrentUserId();
        this.allTargetAreas = await this._exerciseSvc.getTargetAreas().toPromise();
        this.resistanceTypes = await this._exerciseSvc.getResistanceTypes().toPromise();
        this.subscribeToRouteParamsToSetupFormOnExerciseIdChange();
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

    private subscribeToRouteParamsToSetupFormOnExerciseIdChange(): void {
        this._route.params.subscribe(params => {
            console.log("params['id']: ", params['id']);
            this._exerciseId = params['id'];
            if (this._exerciseId != 0)
                this.loadExercise(); 
            else {
                this.setupTargetAreas([]);
                this.exerciseForm.reset();
                this.exerciseForm.controls["id"].setValue(0);
                this.exercise = null;
                this.loading = false;
            }
        });
    }

    private createForm(): void {

        this.exerciseForm = this._formBuilder.group({
            id: [0, Validators.required ], 
            name: ['', Validators.required], 
            description: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])], 
            resistanceTypes: [0, Validators.required], 
            oneSided: [false], //TODO: Solve -- this value remains null, not false, until checked
            endToEnd: [false], //TODO: Same as above
            targetAreas: this._formBuilder.group({}, CustomValidators.formGroupOfBooleansRequireOneTrue),
            setup: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])],
            movement: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])],
            pointsToRemember: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])]
        });

        //TODO: Solve. The below lines don't change anything. Values remain false.
        this.exerciseForm.controls["oneSided"].setValue(false);
        this.exerciseForm.controls["endToEnd"].setValue(false);
        
    }

    private loadExercise(): void {
        this.loading = true;
        console.log("Loading exercise...");
        this._exerciseSvc.getById(this._exerciseId).subscribe((value: Exercise) => {
            console.log("Loaded exercise: ", this.exercise);
            this.exercise = value;
            this.updateFormWithExerciseValues();
            this.loading = false;
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
        exercise.resistanceType = this.exerciseForm.get("resistanceTypes").value;
        exercise.oneSided = Boolean(this.exerciseForm.get("oneSided").value); //Call to Boolean() is a workaround to initializer and setValue() not setting value to false as stated
        
        if (exercise.resistanceType == 2) //TODO: Replace with constant, enum, or other non-hard-coded value!
            exercise.bandsEndToEnd = Boolean(this.exerciseForm.get("endToEnd").value); //Call to Boolean() is a workaround (see above)

        if (exercise.id > 0)
            exercise.modifiedByUserId = this.currentUserId;
        else
            exercise.createdByUserId = this.currentUserId;

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
                    this.currentUserId
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

        this.exerciseForm.controls["resistanceTypes"].setValue(this.exercise.resistanceType);
        this.exerciseForm.controls["oneSided"].setValue(this.exercise.oneSided);
        this.exerciseForm.controls["endToEnd"].setValue(this.exercise.bandsEndToEnd);
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
