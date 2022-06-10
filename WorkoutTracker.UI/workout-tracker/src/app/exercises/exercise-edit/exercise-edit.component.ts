import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../../workouts/models/exercise';
import { TargetArea } from '../../workouts/models/target-area';
import { CustomValidators } from '../../validators/custom-validators';
import { ExerciseTargetAreaLink } from '../../workouts/models/exercise-target-area-link';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.css']
})
export class ExerciseEditComponent implements OnInit {

  //PUBLIC FIELDS
  public exerciseForm: UntypedFormGroup;
  public loading: boolean = true;
  public allTargetAreas: TargetArea[];
  public resistanceTypes: Map<number, string>;
  public infoMsg: string | null = null;
  public readOnlyMode: boolean = false;
  public fromViewRoute: boolean = false;

  //PUBLIC PROPERTIES
  public get isNew(): boolean {
    return !(this._exercise.id > 0);
  }

  public get exerciseId(): number {
    return this._exercise?.id;
  }

  //PRIVATE FIELDS
  private _exercise: Exercise; 
  private _exerciseId: number = 0; //TODO: Refactor. We have an exercise variable. Why have this too?
  private _saving: boolean = false;
  private _errorMsg: string | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _formBuilder: UntypedFormBuilder,
    private _exerciseSvc: ExerciseService) {
  }

  public ngOnInit(): void {
    this.readOnlyMode = this.fromViewRoute = this._route.snapshot.url.join('').indexOf('view') > -1;
    this.createForm();

    //TODO: Rethink the following. This can probably be done a much better way.
    this._exerciseSvc.getTargetAreas().subscribe((targetAreas: TargetArea[]) => { 
      this.allTargetAreas = targetAreas; 
      this._exerciseSvc.getResistanceTypes().subscribe((resistanceTypes: Map<number, string>) => {
        this.resistanceTypes = resistanceTypes;
        this.subscribeToRouteParamsToSetupFormOnExerciseIdChange();
      });
    });
  }

  public editModeToggled(event: any): void { //TODO: Get or specify a concrete type for the event param
    this.readOnlyMode = !event.checked;
  }

  private setupTargetAreas(exerciseTargetAreaLinks: ExerciseTargetAreaLink[]): void {
    //https://stackoverflow.com/questions/40927167/angular-reactiveforms-producing-an-array-of-checkbox-values

    const checkboxesFormGroup = <UntypedFormGroup>this.exerciseForm.get('targetAreas');

    //I wanted to set the value of each checkbox to the ID of the target area, which was fine 
    //initially, but on toggling Angular set the value to a boolean.

    this.allTargetAreas.forEach((targetArea: TargetArea) => {
      checkboxesFormGroup.addControl(targetArea.name, new UntypedFormControl(_.some(exerciseTargetAreaLinks, (link: ExerciseTargetAreaLink) => link.targetAreaId == targetArea.id)));
    });

    checkboxesFormGroup.setValidators(CustomValidators.formGroupOfBooleansRequireOneTrue);
  }

  private subscribeToRouteParamsToSetupFormOnExerciseIdChange(): void {

    //TODO: Re-evaluate. Do I really need to do this? I think a better solution might be to just look at the snapshot.
    //this._route.params.subscribe(params => {

      this._exerciseId = this._route.snapshot.params['id'];
      if (this._exerciseId != 0) {
        this.loadExercise(); 
      }
      else {
        //Creating a new exercise
        this.setupTargetAreas([]);
        this.exerciseForm.reset();
        this.exerciseForm.controls["id"].setValue(0);
        this.exerciseForm.controls["oneSided"].setValue(false);
        this.exerciseForm.controls["endToEnd"].setValue(false);
        this.exerciseForm.controls["involvesReps"].setValue(true);

        this._exercise = new Exercise();
        this.loading = false;
      }
    //}

  }

  private createForm(): void {

    this.exerciseForm = this._formBuilder.group({
      id: [0, Validators.required ], 
      name: ['', Validators.required], 
      description: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])], 
      resistanceTypes: [0, Validators.required], 
      oneSided: [false], //TODO: Solve -- this value remains null, not false, until checked
      endToEnd: [false], //TODO: Same as above
      involvesReps: [true], //TODO: Ditto! -- probably caused by reset() being called later!
      targetAreas: this._formBuilder.group({}, CustomValidators.formGroupOfBooleansRequireOneTrue),
      setup: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])],
      movement: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])],
      pointsToRemember: ['', Validators.compose([Validators.required, Validators.maxLength(4000)])]
    });

    //TODO: Solve. The below lines don't change anything. Values remain false.
    this.exerciseForm.controls["oneSided"].setValue(false);
    this.exerciseForm.controls["endToEnd"].setValue(false);
    this.exerciseForm.controls["involvesReps"].setValue(true);
  }

  private loadExercise(): void {
    this.loading = true;

    this._exerciseSvc.getById(this._exerciseId).subscribe((value: Exercise) => {
      this._exercise = value;
      this.updateFormWithExerciseValues();
      this.loading = false;
    }); //TODO: Handle errors
  }

  private updateExerciseForPersisting(): void {

    //exercise.id = this.exerciseForm.get("id").value;
    this._exercise.name = this.exerciseForm.get("name")?.value;
    this._exercise.description = this.exerciseForm.get("description")?.value;
    this._exercise.setup = this.exerciseForm.get("setup")?.value;
    this._exercise.movement = this.exerciseForm.get("movement")?.value;
    this._exercise.pointsToRemember = this.exerciseForm.get("pointsToRemember")?.value;
    this._exercise.resistanceType = this.exerciseForm.get("resistanceTypes")?.value;
    this._exercise.oneSided = Boolean(this.exerciseForm.get("oneSided")?.value); //Call to Boolean() is a workaround to initializer and setValue() not setting value to false as stated
        
    if (this._exercise.resistanceType == 2) //TODO: Replace with constant, enum, or other non-hard-coded value!
    this._exercise.bandsEndToEnd = Boolean(this.exerciseForm.get("endToEnd")?.value); //Call to Boolean() is a workaround (see above)

    this._exercise.involvesReps = Boolean(this.exerciseForm.get("involvesReps")?.value); //Call to Boolean() is a workaround (see above)

    this._exercise.exerciseTargetAreaLinks = this.getExerciseTargetAreaLinksForPersist();

    //return this.exercise;
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
        if (selectedTargetArea) {
          output.push(new ExerciseTargetAreaLink(
            this._exerciseId, 
            selectedTargetArea.id
          ));
        }
      }
    }

    return output;
  }

  private updateFormWithExerciseValues(): void {
    this.exerciseForm.patchValue ({
      id: this._exercise.id,
      name: this._exercise.name, 
      description: this._exercise.description,
      setup: this._exercise.setup,
      movement: this._exercise.movement,
      pointsToRemember: this._exercise.pointsToRemember
    });

    if (this._exercise.exerciseTargetAreaLinks) {
      this.setupTargetAreas(this._exercise.exerciseTargetAreaLinks);
    }

    this.exerciseForm.controls["resistanceTypes"].setValue(this._exercise.resistanceType);
    this.exerciseForm.controls["oneSided"].setValue(this._exercise.oneSided);
    this.exerciseForm.controls["endToEnd"].setValue(this._exercise.bandsEndToEnd);
    this.exerciseForm.controls["involvesReps"].setValue(this._exercise.involvesReps);
  }

  private saveExercise(): void {
    //Called by Save button
    this._saving = true;
    this.infoMsg = "Saving...";
    this.updateExerciseForPersisting();

    if (this._exerciseId == 0)
      this._exerciseSvc.add(this._exercise)
        .pipe(finalize(() => {
          this._saving = false;
        }))
        .subscribe((addedExercise: Exercise) => {
          this._exercise = addedExercise;
          this._exerciseId = this._exercise.id;
          this.infoMsg = "Exercise created at " + new Date().toLocaleTimeString();
        },
        (error: any) => {
          this._errorMsg = error.message;
        }
      );
    else
      this._exerciseSvc.update(this._exercise)
        .pipe(finalize(() => {
          this._saving = false;
        }))
        .subscribe((updatedExercise: Exercise) => {
          this._exercise = updatedExercise;
          this._saving = false;
          this.infoMsg = "Exercise updated at " + new Date().toLocaleTimeString();
        }, 
        (error: any) => {
          this._errorMsg = error.message;
        }
      );
  }

}
