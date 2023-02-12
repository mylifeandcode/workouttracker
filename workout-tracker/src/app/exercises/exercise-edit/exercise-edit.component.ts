import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Validators, FormControl, FormGroup, FormRecord, FormBuilder } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../../workouts/models/exercise';
import { TargetArea } from '../../workouts/models/target-area';
import { CustomValidators } from '../../validators/custom-validators';
import { ExerciseTargetAreaLink } from '../../workouts/models/exercise-target-area-link';
import { finalize } from 'rxjs/operators';
import { some, find } from 'lodash-es';

interface IExerciseEditForm {
  id: FormControl<number>;
  name: FormControl<string>;
  description: FormControl<string>;
  resistanceTypes: FormControl<number>; //TODO: Rename to singular
  oneSided: FormControl<boolean>;
  endToEnd: FormControl<boolean | null>;
  involvesReps: FormControl<boolean>;
  
  //targetAreas: this._formBuilder.group({}, CustomValidators.formGroupOfBooleansRequireOneTrue),
  //Because our target area keys aren't known until run time, we need to us a FormRecord instead of a FormGroup
  //https://angular.io/guide/typed-forms#formrecord
  targetAreas: FormRecord<FormControl<boolean>>;
  
  setup: FormControl<string>;
  movement: FormControl<string>;
  pointsToRemember: FormControl<string>;
}


@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.scss']
})
export class ExerciseEditComponent implements OnInit {

  //PUBLIC FIELDS
  public exerciseForm: FormGroup<IExerciseEditForm>;
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

  //PUBLIC FIELDS
  public saving: boolean = false;
  public errorMsg: string | null = null;

  //PRIVATE FIELDS
  private _exercise: Exercise; 
  private _exerciseId: number = 0; //TODO: Refactor. We have an exercise variable. Why have this too?

  constructor(
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _exerciseSvc: ExerciseService) {
  }

  //PUBLIC METHODS ////////////////////////////////////////////////////////////
  public ngOnInit(): void {
    this.readOnlyMode = this.fromViewRoute = this._route.snapshot.url.join('').indexOf('view') > -1;
    this.createForm();

    //TODO: Rethink the following. This can probably be done a much better way. Thinking "forkJoin()".
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

  public saveExercise(): void {
    if(!this.exerciseForm.valid) return;

    //Called by Save button
    this.saving = true;
    this.infoMsg = "Saving...";
    this.updateExerciseForPersisting();

    if (this._exerciseId == 0)
      this._exerciseSvc.add(this._exercise)
        .pipe(finalize(() => {
          this.saving = false;
        }))
        .subscribe((addedExercise: Exercise) => {
          this._exercise = addedExercise;
          this._exerciseId = this._exercise.id;
          this.infoMsg = "Exercise created at " + new Date().toLocaleTimeString();
        },
        (error: any) => {
          this.errorMsg = error.message;
        }
      );
    else
      this._exerciseSvc.update(this._exercise)
        .pipe(finalize(() => {
          this.saving = false;
        }))
        .subscribe((updatedExercise: Exercise) => {
          this._exercise = updatedExercise;
          this.saving = false;
          this.infoMsg = "Exercise updated at " + new Date().toLocaleTimeString();
        }, 
        (error: any) => {
          this.errorMsg = error.message;
        }
      );
  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////

  private setupTargetAreas(exerciseTargetAreaLinks: ExerciseTargetAreaLink[]): void {
    //Original approach was using information from
    //https://stackoverflow.com/questions/40927167/angular-reactiveforms-producing-an-array-of-checkbox-values
    //This has since been updated for Typed Forms, which is nicer. :)

    //I wanted to set the value of each checkbox to the ID of the target area, which was fine 
    //initially, but on toggling Angular set the value to a boolean.

    this.allTargetAreas.forEach((targetArea: TargetArea) => {
      const thisTargetAreaIsSelected: boolean = some(exerciseTargetAreaLinks, (link: ExerciseTargetAreaLink) => link.targetAreaId == targetArea.id);
      this.exerciseForm.controls.targetAreas.addControl(
        targetArea.name, 
        new FormControl<boolean>(thisTargetAreaIsSelected, { nonNullable: true }));
    });

    //checkboxesFormGroup.setValidators(CustomValidators.formGroupOfBooleansRequireOneTrue);
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
        this._exercise.id = 0;
        this.loading = false;
      }
    //}

  }

  private createForm(): void {

    this.exerciseForm = this._formBuilder.group<IExerciseEditForm>({
      id: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }), 
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }), 
      description: new FormControl<string>('', { nonNullable: true, validators: Validators.compose([Validators.required, Validators.maxLength(4000)])}), 
      resistanceTypes: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      oneSided: new FormControl<boolean>(false, { nonNullable: true }),
      endToEnd: new FormControl<boolean | null>(false),
      involvesReps: new FormControl<boolean>(true, { nonNullable: true }),
      //targetAreas: this._formBuilder.group({}, CustomValidators.formGroupOfBooleansRequireOneTrue),
      targetAreas: new FormRecord<FormControl<boolean>>({}, { validators: CustomValidators.formGroupOfBooleansRequireOneTrue}),
      setup: new FormControl<string>('', { nonNullable: true, validators: Validators.compose([Validators.required, Validators.maxLength(4000)])}),
      movement: new FormControl<string>('', { nonNullable: true, validators: Validators.compose([Validators.required, Validators.maxLength(4000)])}),
      pointsToRemember: new FormControl<string>('', { nonNullable: true, validators: Validators.compose([Validators.required, Validators.maxLength(4000)])})
    });

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
    this._exercise.name = this.exerciseForm.controls.name.value;
    this._exercise.description = this.exerciseForm.controls.description.value;
    this._exercise.setup = this.exerciseForm.controls.setup.value;
    this._exercise.movement = this.exerciseForm.controls.movement.value;
    this._exercise.pointsToRemember = this.exerciseForm.controls.pointsToRemember.value;
    this._exercise.resistanceType = this.exerciseForm.controls.resistanceTypes.value;
    this._exercise.oneSided = this.exerciseForm.controls.oneSided.value;
        
    if (this._exercise.resistanceType == 2) //TODO: Replace with constant, enum, or other non-hard-coded value!
      this._exercise.bandsEndToEnd = this.exerciseForm.controls.endToEnd?.value;

    this._exercise.involvesReps = this.exerciseForm.controls.involvesReps.value;
    this._exercise.exerciseTargetAreaLinks = this.getExerciseTargetAreaLinksForPersist();

  }

  private getExerciseTargetAreaLinksForPersist(): ExerciseTargetAreaLink[] {
    //Original approach using FormArray found at:
    //https://coryrylan.com/blog/creating-a-dynamic-checkbox-list-in-angular
    //My approach differs due to different control creation from approach learned at:
    //https://stackoverflow.com/questions/40927167/angular-reactiveforms-producing-an-array-of-checkbox-values

    var output: ExerciseTargetAreaLink[] = [];

    for(var key in this.exerciseForm.value.targetAreas) {
      if (this.exerciseForm.value.targetAreas[key]) {
        let selectedTargetArea = find(this.allTargetAreas, (targetArea: TargetArea) => targetArea.name == key); 
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

    this.exerciseForm.controls.resistanceTypes.setValue(this._exercise.resistanceType);
    this.exerciseForm.controls.oneSided.setValue(this._exercise.oneSided);
    this.exerciseForm.controls.endToEnd.setValue(this._exercise.bandsEndToEnd);
    this.exerciseForm.controls.involvesReps.setValue(this._exercise.involvesReps);
  }

}
