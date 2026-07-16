import { Component, OnInit, inject, signal, computed, effect, untracked, ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, required, min, validate, applyEach, applyWhen } from '@angular/forms/signals';
import { AuthService } from '../../core/_services/auth/auth.service';
import { User, UserMinMaxReps, SetType } from '../../api';
import { UserService } from '../../core/_services/user/user.service';
import { catchError, finalize } from 'rxjs/operators';
import { IUserRepSettingsModel, UserRepSettingsComponent } from './user-rep-settings/user-rep-settings.component';
import { CheckForUnsavedDataComponent } from '../../shared/components/check-for-unsaved-data.component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface IUserSettingsModel {
  recommendationsEnabled: boolean;
  repSettings: IUserRepSettingsModel[];
}

@Component({
  selector: 'wt-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  imports: [
    FormField,
    NzSwitchModule,
    UserRepSettingsComponent,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent extends CheckForUnsavedDataComponent implements OnInit {
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _messageService = inject(NzMessageService);

  public loading = signal(true);
  public user = signal<User | undefined>(undefined);
  public saving = signal(false);
  public userSettingsLoaded = signal(false);

  protected readonly model = signal<IUserSettingsModel>({ recommendationsEnabled: false, repSettings: [] });
  public readonly userSettingsForm = form(this.model, (p) => {
    //Rep settings only matter (and only validate) when recommendations are enabled.
    applyWhen(p.repSettings, ({ valueOf }) => valueOf(p.recommendationsEnabled), (rs) => {
      applyEach(rs, (set) => {
        required(set.minReps);
        min(set.minReps, 1);
        min(set.maxReps, 1);
        //Cross-field: was firstControlValueMustBeLessThanOrEqualToSecond('minReps', 'maxReps')
        validate(set, ({ value }) =>
          value().minReps <= value().maxReps
            ? undefined
            : { kind: 'minMax', message: 'Min Reps must be less than or equal to Max Reps.' });
        //Timed sets require a duration >= 1 (was isRequired + Validators.min); N/A for repetition sets.
        validate(set.duration, ({ value, valueOf }) =>
          valueOf(set.setType) === SetType.TIMED && (value() == null || value()! < 1)
            ? { kind: 'required', message: 'Duration is required and must be greater than zero.' }
            : undefined);
      });
    });
  });

  //Fine-grained selector so the toggle effect depends ONLY on this flag (reading model() directly
  //would track the whole model and re-run on every rep-settings edit).
  private readonly _recommendationsEnabled = computed(() => this.model().recommendationsEnabled);

  constructor() {
    super();
    //Replaces the old (ngModelChange)="recommendationEngineToggled()". Track only the flag; run the
    //handler untracked so its model reads/writes don't widen the dependency (see workout-progress).
    effect(() => {
      const enabled = this._recommendationsEnabled();
      untracked(() => this.onRecommendationsToggled(enabled));
    });
  }

  public ngOnInit(): void {
    if (!this._authService.userPublicId) return;
    this._userService.getById(this._authService.userPublicId)
      .pipe(
        finalize(() => { this.loading.set(false); }),
        catchError((err) => {
          window.alert("ERROR: " + err.message);
          throw err.message;
        })
      )
      .subscribe((user: User) => {
        this.user.set(user);
        this.model.set(this.buildModel(user));
        this.userSettingsLoaded.set(true);
      });
  }

  public saveSettings(): void {
    if (!this.user()) return;

    this.updateSettingsForPersist();
    this.saving.set(true);
    this._userService.update(this.user()!)
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.userSettingsForm().reset(); //Clears dirty/touched so the guard lets us navigate away
        }),
        catchError((err) => {
          window.alert("ERROR: " + err.message);
          throw err.message;
        })
      )
      .subscribe(() => {
        this._messageService.success('Settings saved.');
      });
  }

  public hasUnsavedData(): boolean {
    return this.userSettingsForm().dirty();
  }

  private buildModel(user: User): IUserSettingsModel {
    return {
      recommendationsEnabled: user.settings.recommendationsEnabled,
      repSettings: (user.settings.repSettings ?? []).map((value: UserMinMaxReps): IUserRepSettingsModel => ({
        repSettingsId: value.id,
        setType: value.setType,
        duration: value.duration ?? null,
        //Concrete numbers only — Signal Forms won't build a subfield for an undefined value
        minReps: value.minReps ?? 0,
        maxReps: value.maxReps ?? 0
      }))
    };
  }

  //When recommendations are switched on and there are no rep settings yet, seed two defaults
  //(one Repetition, one Timed). Off (or already-populated) is a no-op — the array is kept in the
  //model and simply hidden/unvalidated when off.
  private onRecommendationsToggled(enabled: boolean): void {
    if (!enabled) return;
    if (this.model().repSettings.length > 0) return;

    this.model.update(m => ({
      ...m,
      repSettings: [
        { repSettingsId: 0, setType: SetType.REPETITION, duration: null, minReps: 0, maxReps: 0 },
        { repSettingsId: 0, setType: SetType.TIMED, duration: null, minReps: 0, maxReps: 0 }
      ]
    }));
  }

  private updateSettingsForPersist(): void {
    const user = this.user();
    if (!user) return;

    const m = this.model();
    user.settings.recommendationsEnabled = m.recommendationsEnabled;

    //OFF: the flag alone matters — leave the loaded rep settings untouched (mirrors the old
    //removeControl behavior on persist, minus the per-entry "error retrieving" alert).
    if (!m.recommendationsEnabled) return;

    //ON: rebuild from the model, preserving any other DTO fields on matched (persisted) entries.
    user.settings.repSettings = m.repSettings.map((set: IUserRepSettingsModel): UserMinMaxReps => {
      const existing = set.repSettingsId !== 0
        ? user.settings.repSettings.find((value: UserMinMaxReps) => value.id === set.repSettingsId)
        : undefined;

      return {
        ...(existing ?? {} as UserMinMaxReps),
        id: set.repSettingsId,
        setType: set.setType,
        duration: set.duration,
        minReps: set.minReps,
        maxReps: set.maxReps
      };
    });
  }
}
