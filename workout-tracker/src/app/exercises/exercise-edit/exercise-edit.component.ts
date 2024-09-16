import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Validators, FormControl, FormGroup, FormRecord, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../../workouts/models/exercise';
import { TargetArea } from '../../workouts/models/target-area';
import { CustomValidators } from '../../core/validators/custom-validators';
import { ExerciseTargetAreaLink } from '../../workouts/models/exercise-target-area-link';
import { finalize } from 'rxjs/operators';
import { some, find } from 'lodash-es';
import { CheckForUnsavedDataComponent } from 'app/shared/check-for-unsaved-data.component';
import { ResistanceType } from 'app/workouts/enums/resistance-type';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgClass, KeyValuePipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InsertSpaceBeforeCapitalPipe } from '../../shared/pipes/insert-space-before-capital.pipe';

interface IExerciseEditForm {
  id: FormControl<number>;
  name: FormControl<string>;
  description: FormControl<string>;
  resistanceType: FormControl<number>; //TODO: Rename to singular
  oneSided: FormControl<boolean>;
  endToEnd: FormControl<boolean | null>;
  involvesReps: FormControl<boolean>;
  usesBilateralResistance: FormControl<boolean>;

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
    styleUrls: ['./exercise-edit.component.scss'],
    standalone: true,
    imports: [
      ProgressSpinnerModule, FormsModule, ReactiveFormsModule, NgClass, TooltipModule, InputSwitchModule, 
      KeyValuePipe, InsertSpaceBeforeCapitalPipe
    ]
})
export class ExerciseEditComponent extends CheckForUnsavedDataComponent implements OnInit {

  //PUBLIC FIELDS
  public exerciseForm: FormGroup<IExerciseEditForm>;
  public loading: boolean = true;
  public allTargetAreas: TargetArea[] = [];
  public resistanceTypes: Map<number, string> | undefined;
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

  public resistanceTypeEnum: typeof ResistanceType = ResistanceType; //Needed for template to reference enum

  //PRIVATE FIELDS
  private _exercise: Exercise = new Exercise();
  private _exercisePublicId: string | null = null; //TODO: Refactor. We have an exercise variable. Why have this too?

  constructor(
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _exerciseSvc: ExerciseService) {
    super();
    this.exerciseForm = this.createForm();
    this.exerciseForm.controls.oneSided.valueChanges.subscribe((value: boolean) => this.checkForBilateral(value));
  }

  //PUBLIC METHODS ////////////////////////////////////////////////////////////
  public ngOnInit(): void {
    this.readOnlyMode = this.fromViewRoute = this._route.snapshot.url.join('').indexOf('view') > -1;
    //this.createForm();

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
    if (!this.exerciseForm.valid) return;

    //Called by Save button
    this.saving = true;
    this.infoMsg = "Saving...";
    this.updateExerciseForPersisting();

    //TODO: Refactor to use a pointer to the service method, as both signatures and return types are the same
    if (!this._exercisePublicId)
      this._exerciseSvc.add(this._exercise)
        .pipe(finalize(() => {
          this.saving = false;
          this.exerciseForm.markAsPristine();
        }))
        .subscribe({
          next: (addedExercise: Exercise) => {
            this._exercise = addedExercise;
            this._exercisePublicId = this._exercise.publicId;
            this.infoMsg = "Exercise created at " + new Date().toLocaleTimeString();
          },
          error: (error: any) => {
            this.errorMsg = error.message;
          }
        });
    else
      this._exerciseSvc.update(this._exercise)
        .pipe(finalize(() => {
          this.saving = false;
          this.exerciseForm.markAsPristine();
        }))
        .subscribe({
          next: (updatedExercise: Exercise) => {
            this._exercise = updatedExercise;
            this.saving = false;
            this.infoMsg = "Exercise updated at " + new Date().toLocaleTimeString();
          },
          error: (error: any) => {
            this.errorMsg = error.message;
          }
        });
  }

  public hasUnsavedData(): boolean {
    return this.exerciseForm.dirty;
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

    this._exercisePublicId = this._route.snapshot.params['id'];
    if (this._exercisePublicId) {
      this.loadExercise();
    }
    else {
      //Creating a new exercise
      this.setupTargetAreas([]);
      this.exerciseForm.reset();
      this.exerciseForm.controls.id.setValue(0);
      this.exerciseForm.controls.oneSided.setValue(false);
      this.exerciseForm.controls.endToEnd.setValue(false);
      this.exerciseForm.controls.involvesReps.setValue(true);

      this._exercise = new Exercise();
      this._exercise.id = 0;
      this.loading = false;
    }
    //}

  }

  private createForm(): FormGroup<IExerciseEditForm> {

    return this._formBuilder.group<IExerciseEditForm>({
      id: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      description: new FormControl<string>('', { nonNullable: true, validators: Validators.compose([Validators.required, Validators.maxLength(4000)]) }),
      resistanceType: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      oneSided: new FormControl<boolean>(false, { nonNullable: true }),
      endToEnd: new FormControl<boolean | null>(false),
      involvesReps: new FormControl<boolean>(true, { nonNullable: true }),
      usesBilateralResistance: new FormControl<boolean>(false, { nonNullable: true }),
      targetAreas: new FormRecord<FormControl<boolean>>({}, { validators: CustomValidators.formGroupOfBooleansRequireOneTrue }),
      setup: new FormControl<string>('', { nonNullable: true, validators: Validators.compose([Validators.required, Validators.maxLength(4000)]) }),
      movement: new FormControl<string>('', { nonNullable: true, validators: Validators.compose([Validators.required, Validators.maxLength(4000)]) }),
      pointsToRemember: new FormControl<string>('', { nonNullable: true, validators: Validators.compose([Validators.required, Validators.maxLength(4000)]) })
    });

  }

  private loadExercise(): void {
    if (!this._exercisePublicId) return;
    this.loading = true;

    this._exerciseSvc.getByPublicId(this._exercisePublicId).subscribe((value: Exercise) => {
      this._exercise = value;
      this.updateFormWithExerciseValues();
      this.loading = false;
    }); //TODO: Handle errors
  }

  private updateExerciseForPersisting(): void {

    this._exercise.name = this.exerciseForm.controls.name.value;
    this._exercise.description = this.exerciseForm.controls.description.value;
    this._exercise.setup = this.exerciseForm.controls.setup.value;
    this._exercise.movement = this.exerciseForm.controls.movement.value;
    this._exercise.pointsToRemember = this.exerciseForm.controls.pointsToRemember.value;
    this._exercise.resistanceType = this.exerciseForm.controls.resistanceType.value;
    this._exercise.oneSided = this.exerciseForm.controls.oneSided.value;

    if (this._exercise.resistanceType == 2) //TODO: Replace with constant, enum, or other non-hard-coded value!
      this._exercise.bandsEndToEnd = this.exerciseForm.controls.endToEnd?.value;

    this._exercise.involvesReps = this.exerciseForm.controls.involvesReps.value;
    this._exercise.usesBilateralResistance = this.exerciseForm.controls.usesBilateralResistance.value;

    this._exercise.exerciseTargetAreaLinks = this.getExerciseTargetAreaLinksForPersist();
  }

  private getExerciseTargetAreaLinksForPersist(): ExerciseTargetAreaLink[] {
    //Original approach using FormArray found at:
    //https://coryrylan.com/blog/creating-a-dynamic-checkbox-list-in-angular
    //My approach differs due to different control creation from approach learned at:
    //https://stackoverflow.com/questions/40927167/angular-reactiveforms-producing-an-array-of-checkbox-values

    const output: ExerciseTargetAreaLink[] = [];

    for (const key in this.exerciseForm.value.targetAreas) {
      if (this.exerciseForm.value.targetAreas[key]) {
        const selectedTargetArea = find(this.allTargetAreas, (targetArea: TargetArea) => targetArea.name == key);
        if (selectedTargetArea) {
          output.push(new ExerciseTargetAreaLink(
            this._exercise.id,
            selectedTargetArea.id
          ));
        }
      }
    }

    return output;
  }

  private updateFormWithExerciseValues(): void {
    this.exerciseForm.patchValue({
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

    this.exerciseForm.controls.resistanceType.setValue(this._exercise.resistanceType);
    this.exerciseForm.controls.oneSided.setValue(this._exercise.oneSided);
    this.exerciseForm.controls.endToEnd.setValue(this._exercise.bandsEndToEnd);
    this.exerciseForm.controls.involvesReps.setValue(this._exercise.involvesReps);
    this.exerciseForm.controls.usesBilateralResistance.setValue(this._exercise.usesBilateralResistance);
  }

  private checkForBilateral(oneSided: boolean): void {
    if (oneSided) {
      if (this.exerciseForm.controls.usesBilateralResistance.value)
        this.exerciseForm.controls.usesBilateralResistance.setValue(false);

      this.exerciseForm.controls.usesBilateralResistance.disable();
    }
    else
      this.exerciseForm.controls.usesBilateralResistance.enable();
  }

}
