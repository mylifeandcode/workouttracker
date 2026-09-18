import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormField, required, maxLength, disabled, validate, submit } from '@angular/forms/signals';
import { ExerciseService } from '../_services/exercise.service';
import { TargetAreaService } from '../_services/target-area.service';
import { TargetAreaDTO, ResistanceType, Exercise, ExerciseDetailDTO, ExerciseTargetAreaLink } from '../../api';
import { CheckForUnsavedDataComponent } from '../../shared/components/check-for-unsaved-data.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { KeyValuePipe } from '@angular/common';
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
    NzSpinModule, FormsModule, FormField, NzTooltipModule, NzSwitchModule,
    KeyValuePipe, InsertSpaceBeforeCapitalPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseEditComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _exerciseSvc = inject(ExerciseService);
  private _targetAreaSvc = inject(TargetAreaService);
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
    disabled(p.usesBilateralResistance, { when: ({ valueOf }) => valueOf(p.oneSided) });

    // Replaces CustomValidators.formGroupOfBooleansRequireOneTrue on the FormRecord
    validate(p.targetAreas, ({ value }) =>
      value().some((area) => area.selected)
        ? undefined
        : { kind: 'requireOne', message: 'At least one Target Area is required' });
  });

  public loading = signal<boolean>(true);
  public allTargetAreas: TargetAreaDTO[] = [];
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
  private _exercise: ExerciseDetailDTO = this.buildEmptyExercise();
  private _exercisePublicId: string | null = null; //TODO: Refactor. We have an exercise variable. Why have this too?

  //PUBLIC METHODS ////////////////////////////////////////////////////////////
  public ngOnInit(): void {
    this.editModeEnabled.set(this._route.snapshot.url.join('').indexOf('view') == -1);

    forkJoin({
      targetAreas: this._targetAreaSvc.getAll(),
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
      const exerciseToPersist = this.buildExerciseForPersisting();

      const isNew = !this._exercisePublicId;
      try {
        const saved = await firstValueFrom(
          isNew ? this._exerciseSvc.add(exerciseToPersist) : this._exerciseSvc.update(exerciseToPersist)
        );
        this._exercise = this.toExerciseDetailDTO(saved);

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
    return this.allTargetAreas.map((targetArea: TargetAreaDTO) => ({
      id: targetArea.id,
      name: targetArea.name,
      selected: selectedIds.includes(targetArea.id)
    }));
  }

  private loadExercise(): void {
    if (!this._exercisePublicId) return;
    this.loading.set(true);

    this._exerciseSvc.getById(this._exercisePublicId).subscribe((value: ExerciseDetailDTO) => {
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
      this._exercise = this.buildEmptyExercise();
      this.model.set({
        ...this.buildEmptyModel(),
        targetAreas: this.buildTargetAreaSelections([])
      });
      this.loading.set(false);
    }

  }

  private setModelFromExercise(exercise: ExerciseDetailDTO): void {
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
      targetAreas: this.buildTargetAreaSelections(exercise.targetAreaIds ?? []),
      setup: exercise.setup ?? '',
      movement: exercise.movement ?? '',
      pointsToRemember: exercise.pointsToRemember ?? ''
    });
  }

  //Builds a full write payload from scratch — _exercise is the leaner ExerciseDetailDTO now, so
  //it can't be mutated-and-reused as the Post/Put body the way the raw Exercise entity used to be.
  //Id/createdByUserId/createdDateTime are carried over from the loaded exercise because Put's
  //server-side SetModifiedAuditFields only touches the Modified* fields, so these three must
  //survive the round-trip intact or the update overwrites them with junk.
  private buildExerciseForPersisting(): Exercise {
    const m = this.model();
    const resistanceType = Number(m.resistanceType) as ResistanceType;

    return {
      id: this._exercise.id,
      publicId: m.publicId,
      createdByUserId: this._exercise.createdByUserId,
      createdDateTime: this._exercise.createdDateTime,
      name: m.name,
      description: m.description,
      setup: m.setup,
      movement: m.movement,
      pointsToRemember: m.pointsToRemember,
      resistanceType,
      oneSided: m.oneSided,
      bandsEndToEnd: resistanceType === ExerciseEditComponent.RESISTANCE_BANDS_TYPE ? m.endToEnd : this._exercise.bandsEndToEnd,
      involvesReps: m.involvesReps,
      //When one-sided, bilateral resistance does not apply (the field is disabled in the UI)
      usesBilateralResistance: m.oneSided ? false : m.usesBilateralResistance,
      exerciseTargetAreaLinks: this.getExerciseTargetAreaLinksForPersist()
    };
  }

  private getExerciseTargetAreaLinksForPersist(): ExerciseTargetAreaLink[] {
    return this.model().targetAreas
      .filter((area: ITargetAreaSelection) => area.selected)
      .map((area: ITargetAreaSelection) => (<ExerciseTargetAreaLink>{
        exerciseId: this._exercise.id,
        targetAreaId: area.id
      }));
  }

  private buildEmptyExercise(): ExerciseDetailDTO {
    return {
      id: 0,
      publicId: EMPTY_GUID,
      createdByUserId: 0,
      createdDateTime: new Date(),
      name: '',
      description: '',
      setup: '',
      movement: '',
      pointsToRemember: '',
      resistanceType: ResistanceType.FREE_WEIGHT,
      oneSided: false,
      bandsEndToEnd: null,
      involvesReps: true,
      usesBilateralResistance: false,
      targetAreaIds: []
    };
  }

  private toExerciseDetailDTO(exercise: Exercise): ExerciseDetailDTO {
    return {
      id: exercise.id,
      publicId: exercise.publicId,
      createdByUserId: exercise.createdByUserId,
      createdDateTime: exercise.createdDateTime,
      name: exercise.name,
      description: exercise.description,
      setup: exercise.setup,
      movement: exercise.movement,
      pointsToRemember: exercise.pointsToRemember,
      resistanceType: exercise.resistanceType,
      oneSided: exercise.oneSided,
      bandsEndToEnd: exercise.bandsEndToEnd ?? null,
      involvesReps: exercise.involvesReps,
      usesBilateralResistance: exercise.usesBilateralResistance,
      targetAreaIds: (exercise.exerciseTargetAreaLinks ?? []).map((link: ExerciseTargetAreaLink) => link.targetAreaId)
    };
  }

}
