import { Component, OnInit, inject, signal, ChangeDetectionStrategy, input, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExerciseService } from '../_services/exercise.service';
import { Exercise } from '../../workouts/_models/exercise';
import { TargetArea } from '../../workouts/_models/target-area';
import { finalize } from 'rxjs/operators';
import { CheckForUnsavedDataComponent } from 'app/shared/components/check-for-unsaved-data.component';
import { ResistanceType } from 'app/workouts/workout/_enums/resistance-type';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgClass, KeyValuePipe, JsonPipe } from '@angular/common';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { InsertSpaceBeforeCapitalPipe } from '../../shared/pipes/insert-space-before-capital.pipe';
import { forkJoin } from 'rxjs';
import {
  form,
  required,
  maxLength,
  validate,
  Field,
  customError,
} from '@angular/forms/signals';
import { ValidationErrorsComponent } from 'app/shared/components/validation-errors/validation-errors.component';
import { TargetAreasComponent } from './target-areas/target-areas.component';


@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.scss'],
  imports: [
    NzSpinModule, FormsModule, ReactiveFormsModule, NgClass, NzToolTipModule, NzSwitchModule,
    KeyValuePipe, InsertSpaceBeforeCapitalPipe, Field, ValidationErrorsComponent, TargetAreasComponent, JsonPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseEditComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _exerciseSvc = inject(ExerciseService);
  private _router = inject(Router);

  //CONSTANTS
  private static readonly MAX_TEXT_LENGTH = 4000;
  private static readonly RESISTANCE_BANDS_TYPE = 2;

  id = input<string | undefined>();

  //SIGNALS
  public loading = signal<boolean>(true);
  public allTargetAreas = signal<TargetArea[]>([]);
  public resistanceTypes = signal<Map<number, string> | undefined>(undefined);
  public infoMsg = signal<string | null>(null);
  public editModeEnabled = signal(false);

  //SIGNAL FORMS
  private _exerciseModel = signal<Exercise>(new Exercise()); //Signal Forms
  public form = form<Exercise>(this._exerciseModel, (path) => {
    required(path.id);
    required(path.publicId);
    required(path.name);
    required(path.description);
    validate(path.exerciseTargetAreaLinks, (ctx) => {
      const value = ctx.value();
      if (value.length > 0) {
        return null;
      }
      return customError({
        kind: 'atLeastOneRequired',
        message: 'At least one Target Area is required'
      });
    });
    maxLength(path.description, ExerciseEditComponent.MAX_TEXT_LENGTH);
    required(path.resistanceType);
    /*
    validate(path.resistanceType, (ctx) => {
      const value = ctx.value();
      if (ctx.value() === ExerciseEditComponent.RESISTANCE_BANDS_TYPE) {
        required(path.bandsEndToEnd)
      };
    });
    */
    required(path.setup);
    maxLength(path.setup, ExerciseEditComponent.MAX_TEXT_LENGTH);
    required(path.movement);
    maxLength(path.movement, ExerciseEditComponent.MAX_TEXT_LENGTH);
    required(path.pointsToRemember);
    maxLength(path.pointsToRemember, ExerciseEditComponent.MAX_TEXT_LENGTH);
  });

  //PUBLIC PROPERTIES
  public get isNew(): boolean {
    return !(this.form().value().id > 0);
  }

  public get exerciseId(): number {
    return this.form().value().id;
  }

  //PUBLIC FIELDS
  public saving = signal<boolean>(false);
  public errorMsg = signal<string | null>(null);

  public resistanceTypeEnum: typeof ResistanceType = ResistanceType; //Needed for template to reference enum

  constructor() {
    super();
  }

  /*
  effect((): void => {
    if (this.id() != undefined) {
      this.loadExercise();
    }
  });
  */

  //PUBLIC METHODS ////////////////////////////////////////////////////////////
  public ngOnInit(): void {
    this.editModeEnabled.set(this._route.snapshot.url.join('').indexOf('view') == -1);

    forkJoin({
      targetAreas: this._exerciseSvc.getTargetAreas(),
      resistanceTypes: this._exerciseSvc.getResistanceTypes()
    }).subscribe(({ targetAreas, resistanceTypes }) => {
      this.allTargetAreas.set(targetAreas);
      this.resistanceTypes.set(resistanceTypes);

      if (this.id() != undefined) {
        this.loadExercise();
      }
    });

    //console.log('VIEW MODEL', this._exerciseModel());
    //this.subscribeToRouteParamsToSetupFormOnExerciseIdChange();
  }

  public saveExercise(): void {
    if (!this.form().valid) return;

    //Called by Save button
    this.saving.set(true);
    this.infoMsg.set("Saving...");
    //this.updateExerciseForPersisting();

    //TODO: Refactor to use a pointer to the service method, as both signatures and return types are the same
    if (this._exerciseModel().id === 0)
      this._exerciseSvc.add(this.form().value())
        .pipe(finalize(() => {
          this.saving.set(false);
          this.form().reset();
        }))
        .subscribe({
          next: (addedExercise: Exercise) => {
            this.infoMsg.set("Exercise created at " + new Date().toLocaleTimeString());
            this._router.navigate([`exercises/edit/${addedExercise.publicId}`]);
          },
          error: (error: any) => {
            this.errorMsg.set(error.message);
          }
        });
    else
      this._exerciseSvc.update(this.form().value())
        .pipe(finalize(() => {
          this.saving.set(false);
          this.form().reset();
        }))
        .subscribe({
          next: (updatedExercise: Exercise) => {
            this._exerciseModel.set(updatedExercise);
            this.saving.set(false);
            this.infoMsg.set("Exercise updated at " + new Date().toLocaleTimeString());
          },
          error: (error: any) => {
            this.errorMsg.set(error.message);
          }
        });
  }

  public hasUnsavedData(): boolean {
    return this.form().dirty();
  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////

  private loadExercise(): void {
    const exerciseId = this.id();
    if (!exerciseId) {
      return;
    }
    else {
      this.loading.set(true);
      this._exerciseSvc.getById(exerciseId).subscribe((value: Exercise) => {
        console.log('LOADED EXERCISE', value);
        this._exerciseModel.set(value); //Signal Forms
        console.log('EXERCISE MODEL', this._exerciseModel());
        this.loading.set(false);
      }); //TODO: Handle errors
    }
  }

  /*
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
      this.exerciseForm.controls.publicId.setValue(EMPTY_GUID);
      this.exerciseForm.controls.oneSided.setValue(false);
      this.exerciseForm.controls.endToEnd.setValue(false);
      this.exerciseForm.controls.involvesReps.setValue(true);
      this._exercise = new Exercise();
      this._exercise.id = 0;
      this._exerciseModel.set(this._exercise); //Signal Forms
      this.loading.set(false);
    }
    //}

  }
  */

  /*
  private createForm(): FormGroup<IExerciseEditForm> {

    return this._formBuilder.group<IExerciseEditForm>({
      id: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      publicId: new FormControl<string>(EMPTY_GUID, { nonNullable: true, validators: Validators.required }),
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      description: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(ExerciseEditComponent.MAX_TEXT_LENGTH)]
      }),
      resistanceType: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
      oneSided: new FormControl<boolean>(false, { nonNullable: true }),
      endToEnd: new FormControl<boolean | null>(false),
      involvesReps: new FormControl<boolean>(true, { nonNullable: true }),
      usesBilateralResistance: new FormControl<boolean>(false, { nonNullable: true }),
      targetAreas: new FormRecord<FormControl<boolean>>({}, {
        validators: CustomValidators.formGroupOfBooleansRequireOneTrue
      }),
      setup: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(ExerciseEditComponent.MAX_TEXT_LENGTH)]
      }),
      movement: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(ExerciseEditComponent.MAX_TEXT_LENGTH)]
      }),
      pointsToRemember: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(ExerciseEditComponent.MAX_TEXT_LENGTH)]
      })
    });

  }
  */

  /*
  private updateExerciseForPersisting(): void {

    this._exercise.publicId = this.exerciseForm.controls.publicId.value;
    this._exercise.name = this.exerciseForm.controls.name.value;
    this._exercise.description = this.exerciseForm.controls.description.value;
    this._exercise.setup = this.exerciseForm.controls.setup.value;
    this._exercise.movement = this.exerciseForm.controls.movement.value;
    this._exercise.pointsToRemember = this.exerciseForm.controls.pointsToRemember.value;
    this._exercise.resistanceType = this.exerciseForm.controls.resistanceType.value;
    this._exercise.oneSided = this.exerciseForm.controls.oneSided.value;

    if (this._exercise.resistanceType == ExerciseEditComponent.RESISTANCE_BANDS_TYPE)
      this._exercise.bandsEndToEnd = this.exerciseForm.controls.endToEnd?.value;

    this._exercise.involvesReps = this.exerciseForm.controls.involvesReps.value;
    this._exercise.usesBilateralResistance = this.exerciseForm.controls.usesBilateralResistance.value;

    this._exercise.exerciseTargetAreaLinks = this.getExerciseTargetAreaLinksForPersist();
  }
  */

  /*
  private getExerciseTargetAreaLinksForPersist(): ExerciseTargetAreaLink[] {
    //Original approach using FormArray found at:
    //https://coryrylan.com/blog/creating-a-dynamic-checkbox-list-in-angular
    //My approach differs due to different control creation from approach learned at:
    //https://stackoverflow.com/questions/40927167/angular-reactiveforms-producing-an-array-of-checkbox-values

    const output: ExerciseTargetAreaLink[] = [];

    for (const key in this.exerciseForm.value.targetAreas) {
      if (this.exerciseForm.value.targetAreas[key]) {
        const selectedTargetArea = this.allTargetAreas().find(
          (targetArea: TargetArea) => targetArea.name == key
        );
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
  */

  /*
  private updateFormWithExerciseValues(): void {
    this.exerciseForm.patchValue({
      id: this._exercise.id,
      publicId: this._exercise.publicId ?? undefined,
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
  */

  /*
  private checkForBilateral(oneSided: boolean): void {
    if (oneSided) {
      if (this.exerciseForm.controls.usesBilateralResistance.value)
        this.exerciseForm.controls.usesBilateralResistance.setValue(false);

      this.exerciseForm.controls.usesBilateralResistance.disable();
    }
    else
      this.exerciseForm.controls.usesBilateralResistance.enable();
  }
  */

}
