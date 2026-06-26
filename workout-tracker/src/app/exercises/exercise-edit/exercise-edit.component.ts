import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormField, required, maxLength, disabled, validate, submit } from '@angular/forms/signals';
import { ExerciseService } from '../_services/exercise.service';
import { TargetArea, ResistanceType, Exercise, ExerciseTargetAreaLink } from '../../api';
import { CheckForUnsavedDataComponent } from '../../shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgClass, KeyValuePipe } from '@angular/common';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';
import { InsertSpaceBeforeCapitalPipe } from '../../shared/pipes/insert-space-before-capital.pipe';
import { EMPTY_GUID } from '../../shared/constants/feature-agnostic-constants';
import { forkJoin, firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface ITargetAreaSelection {
  id: number;
  name: string;
  selected: boolean;
}

interface IExerciseEditModel {
  id: number;
  publicId: string; //Will be EMPTY_GUID for a new Exercise
  name: string;
  description: string;
  resistanceType: string; //Native <select> values are strings; converted to the numeric enum at persist time
  oneSided: boolean;
  endToEnd: boolean;
  involvesReps: boolean;
  usesBilateralResistance: boolean;
  targetAreas: ITargetAreaSelection[];
  setup: string;
  movement: string;
  pointsToRemember: string;
}

@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.scss'],
  imports: [
    NzSpinModule, FormsModule, FormField, NgClass, NzTooltipModule, NzSwitchModule,
    KeyValuePipe, InsertSpaceBeforeCapitalPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseEditComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _exerciseSvc = inject(ExerciseService);
  private _router = inject(Router);

  // Constants
  private static readonly MAX_TEXT_LENGTH = 4000;
  private static readonly RESISTANCE_BANDS_TYPE = 2;

  //PUBLIC FIELDS
  protected readonly model = signal<IExerciseEditModel>(this.buildEmptyModel());
  public readonly exerciseForm = form(this.model, (p) => {
    required(p.name, { message: 'Required' });
    required(p.description, { message: 'Required' });
    maxLength(p.description, ExerciseEditComponent.MAX_TEXT_LENGTH, { message: 'Max length exceeded' });
    required(p.setup, { message: 'Required' });
    maxLength(p.setup, ExerciseEditComponent.MAX_TEXT_LENGTH, { message: 'Max length exceeded' });
    required(p.movement, { message: 'Required' });
    maxLength(p.movement, ExerciseEditComponent.MAX_TEXT_LENGTH, { message: 'Max length exceeded' });
    required(p.pointsToRemember, { message: 'Required' });
    maxLength(p.pointsToRemember, ExerciseEditComponent.MAX_TEXT_LENGTH, { message: 'Max length exceeded' });

    // Replaces the old oneSided.valueChanges subscription + checkForBilateral()
    disabled(p.usesBilateralResistance, ({ valueOf }) => valueOf(p.oneSided));

    // Replaces CustomValidators.formGroupOfBooleansRequireOneTrue on the FormRecord
    validate(p.targetAreas, ({ value }) =>
      value().some((area) => area.selected)
        ? undefined
        : { kind: 'requireOne', message: 'At least one Target Area is required' });
  });

  public loading = signal<boolean>(true);
  public allTargetAreas: TargetArea[] = [];
  public resistanceTypes: Map<number, string> | undefined;
  public infoMsg = signal<string | null>(null);
  public editModeEnabled = signal(false);
  public saving = signal<boolean>(false);
  public errorMsg = signal<string | null>(null);

  public resistanceTypeEnum: typeof ResistanceType = ResistanceType; //Needed for template to reference enum

  //PUBLIC PROPERTIES
  public get isNew(): boolean {
    return !(this._exercise.id > 0);
  }

  public get exerciseId(): number {
    return this._exercise?.id;
  }

  //PRIVATE FIELDS
  private _exercise: Exercise = <Exercise>{};
  private _exercisePublicId: string | null = null; //TODO: Refactor. We have an exercise variable. Why have this too?

  //PUBLIC METHODS ////////////////////////////////////////////////////////////
  public ngOnInit(): void {
    this.editModeEnabled.set(this._route.snapshot.url.join('').indexOf('view') == -1);

    forkJoin({
      targetAreas: this._exerciseSvc.getTargetAreas(),
      resistanceTypes: this._exerciseSvc.getResistanceTypes()
    }).subscribe(({ targetAreas, resistanceTypes }) => {
      this.allTargetAreas = targetAreas;
      this.resistanceTypes = resistanceTypes;
      this.subscribeToRouteParamsToSetupFormOnExerciseIdChange();
    });
  }

  public saveExercise(): void {
    //submit() marks all fields touched and only runs the action when the form is valid.
    submit(this.exerciseForm, async () => {
      this.saving.set(true);
      this.infoMsg.set("Saving...");
      this.errorMsg.set(null);
      this.updateExerciseForPersisting();

      const isNew = !this._exercisePublicId;
      try {
        const saved = await firstValueFrom(
          isNew ? this._exerciseSvc.add(this._exercise) : this._exerciseSvc.update(this._exercise)
        );
        this._exercise = saved;

        if (isNew) {
          this._exercisePublicId = this._exercise.publicId;
          this.infoMsg.set("Exercise created at " + new Date().toLocaleTimeString());
          this._router.navigate([`exercises/edit/${this._exercise.publicId}`]);
        } else {
          this.infoMsg.set("Exercise updated at " + new Date().toLocaleTimeString());
        }

        this.exerciseForm().reset(); //Clears touched/dirty so the unsaved-changes guard won't block navigation
      } catch (error) {
        this.errorMsg.set((error as HttpErrorResponse).message);
      } finally {
        this.saving.set(false);
      }
    });
  }

  public hasUnsavedData(): boolean {
    return this.exerciseForm().dirty();
  }

  //PRIVATE METHODS ///////////////////////////////////////////////////////////

  private buildEmptyModel(): IExerciseEditModel {
    return {
      id: 0,
      publicId: EMPTY_GUID,
      name: '',
      description: '',
      resistanceType: '0',
      oneSided: false,
      endToEnd: false,
      involvesReps: true,
      usesBilateralResistance: false,
      targetAreas: [],
      setup: '',
      movement: '',
      pointsToRemember: ''
    };
  }

  private buildTargetAreaSelections(selectedIds: number[]): ITargetAreaSelection[] {
    return this.allTargetAreas.map((targetArea: TargetArea) => ({
      id: targetArea.id,
      name: targetArea.name,
      selected: selectedIds.includes(targetArea.id)
    }));
  }

  private loadExercise(): void {
    if (!this._exercisePublicId) return;
    this.loading.set(true);

    this._exerciseSvc.getById(this._exercisePublicId).subscribe((value: Exercise) => {
      this._exercise = value;
      this.setModelFromExercise(value);
      this.loading.set(false);
    }); //TODO: Handle errors
  }

  private subscribeToRouteParamsToSetupFormOnExerciseIdChange(): void {

    this._exercisePublicId = this._route.snapshot.params['id'];
    if (this._exercisePublicId) {
      this.loadExercise();
    }
    else {
      //Creating a new exercise
      this._exercise = <Exercise>{};
      this._exercise.id = 0;
      this.model.set({
        ...this.buildEmptyModel(),
        targetAreas: this.buildTargetAreaSelections([])
      });
      this.loading.set(false);
    }

  }

  private setModelFromExercise(exercise: Exercise): void {
    const selectedIds: number[] = (exercise.exerciseTargetAreaLinks ?? [])
      .map((link: ExerciseTargetAreaLink) => link.targetAreaId);

    this.model.set({
      id: exercise.id,
      publicId: exercise.publicId ?? EMPTY_GUID,
      name: exercise.name ?? '',
      description: exercise.description ?? '',
      resistanceType: String(exercise.resistanceType ?? 0),
      oneSided: exercise.oneSided ?? false,
      endToEnd: exercise.bandsEndToEnd ?? false,
      involvesReps: exercise.involvesReps ?? true,
      usesBilateralResistance: exercise.usesBilateralResistance ?? false,
      targetAreas: this.buildTargetAreaSelections(selectedIds),
      setup: exercise.setup ?? '',
      movement: exercise.movement ?? '',
      pointsToRemember: exercise.pointsToRemember ?? ''
    });
  }

  private updateExerciseForPersisting(): void {
    const m = this.model();

    this._exercise.publicId = m.publicId;
    this._exercise.name = m.name;
    this._exercise.description = m.description;
    this._exercise.setup = m.setup;
    this._exercise.movement = m.movement;
    this._exercise.pointsToRemember = m.pointsToRemember;
    this._exercise.resistanceType = Number(m.resistanceType) as ResistanceType;
    this._exercise.oneSided = m.oneSided;

    if (this._exercise.resistanceType == ExerciseEditComponent.RESISTANCE_BANDS_TYPE)
      this._exercise.bandsEndToEnd = m.endToEnd;

    this._exercise.involvesReps = m.involvesReps;
    //When one-sided, bilateral resistance does not apply (the field is disabled in the UI)
    this._exercise.usesBilateralResistance = m.oneSided ? false : m.usesBilateralResistance;

    this._exercise.exerciseTargetAreaLinks = this.getExerciseTargetAreaLinksForPersist();
  }

  private getExerciseTargetAreaLinksForPersist(): ExerciseTargetAreaLink[] {
    return this.model().targetAreas
      .filter((area: ITargetAreaSelection) => area.selected)
      .map((area: ITargetAreaSelection) => (<ExerciseTargetAreaLink>{
        exerciseId: this._exercise.id,
        targetAreaId: area.id
      }));
  }

}
