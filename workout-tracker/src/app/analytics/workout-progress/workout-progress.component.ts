import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { WorkoutDTO } from 'app/workouts/_models/workout-dto';
import { WorkoutService } from 'app/workouts/_services/workout.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AnalyticsService, METRICS_TYPE } from '../_services/analytics.service';
import { AnalyticsChartData } from '../_models/analytics-chart-data';
import { ExecutedWorkoutMetrics } from '../_models/executed-workout-metrics';
import { sortBy } from 'lodash-es';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SelectOnFocusDirective } from '../../shared/directives/select-on-focus.directive';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Chart } from 'chart.js';

interface IWorkoutProgressForm {
  workoutId: FormControl<string | null>,
  workoutCount: FormControl<number>,
  exerciseId: FormControl<string | null>
}

@Component({
    selector: 'wt-workout-progress',
    templateUrl: './workout-progress.component.html',
    styleUrls: ['./workout-progress.component.scss'],
    imports: [ReactiveFormsModule, SelectOnFocusDirective, NzSpinModule, NzTabsModule]
})
export class WorkoutProgressComponent implements OnInit, OnDestroy {
  @ViewChild('formAndRangeOfMotionChart') formAndRangeOfMotionChartCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('repsChart') repsChartCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('resistanceChart') resistanceChartCanvasRef!: ElementRef<HTMLCanvasElement>;

  private _analyticsService = inject(AnalyticsService);
  private _workoutService = inject(WorkoutService);


  public loadingData: boolean = true;
  public metrics: ExecutedWorkoutMetrics[] = [];
  public formAndRangeOfMotionChartData: AnalyticsChartData | null = null;
  public repsChartData: AnalyticsChartData | null = null;
  public resistanceChartData: AnalyticsChartData | null = null;
  public workouts: WorkoutDTO[] = [];
  public formAndRangeOfMotionChartOptions = { //Type "any" because of ChartJS
    scales: {
      y: {
        ticks: {
          callback: (value: number, index: number, ticks: number): string => {
            //TODO: Leverage RatingPipe for this
            switch (value) {
              case 0:
                return 'N/A';
              case 1:
                return 'Bad';
              case 2:
                return 'Poor';
              case 3:
                return 'OK';
              case 4:
                return 'Good';
              case 5:
                return 'Excellent';
              default:
                return '';
            }
          }
        }
      }
    }
  };

  public form: FormGroup<IWorkoutProgressForm>;
  public readonly DEFAULT_WORKOUT_COUNT: number = 5;

  private _workoutId$: Subscription | undefined;
  private _workoutCount$: Subscription | undefined;
  private _exerciseId$: Subscription | undefined;

  constructor() {
    const formBuilder = inject(FormBuilder);

    this.form = this.buildForm(formBuilder);
  }

  public ngOnInit(): void {
    this.getUserWorkouts(); //TODO: Specify number to get instead of default
  }

  public ngOnDestroy(): void {
    //console.log('this._workoutId$: ', this._workoutId$);
    if (this._workoutId$) this._workoutId$.unsubscribe();
    if (this._workoutCount$) this._workoutCount$.unsubscribe();
    if (this._exerciseId$) this._exerciseId$.unsubscribe();
  }

  private getMetrics(workoutPublicId: string): void {
    this.metrics = [];
    const count = this.form.controls.workoutCount.value;

    this._analyticsService.getExecutedWorkoutMetrics(workoutPublicId, count)
      .pipe(
        finalize(() => {
          this.loadingData = false;
        })
      )
      .subscribe((results: ExecutedWorkoutMetrics[]) => {
        this.metrics = results;
      });
  }

  private setupChartData(exerciseId: string): void {
    this.formAndRangeOfMotionChartData = this._analyticsService.getExerciseChartData(this.metrics, exerciseId, METRICS_TYPE.FormAndRangeOfMotion);
    this.repsChartData = this._analyticsService.getExerciseChartData(this.metrics, exerciseId, METRICS_TYPE.Reps);
    this.resistanceChartData = this._analyticsService.getExerciseChartData(this.metrics, exerciseId, METRICS_TYPE.Resistance);


    //TODO: Refactor to use a method, parameterize
    const formAndRangeContext = this.formAndRangeOfMotionChartCanvasRef.nativeElement.getContext('2d');
    if (formAndRangeContext) {
      new Chart(formAndRangeContext, {
        type: 'line',
        data: this.formAndRangeOfMotionChartData,
        options: {
          responsive: true,
        }
      });
    }

    const repsContext = this.repsChartCanvasRef.nativeElement.getContext('2d');
    if (repsContext) {
      new Chart(repsContext, {
        type: 'line',
        data: this.repsChartData,
        options: {
          responsive: true,
        }
      });
    }
    
    const resistanceContext = this.resistanceChartCanvasRef.nativeElement.getContext('2d');
    if (resistanceContext) {
      new Chart(resistanceContext, {
        type: 'line',
        data: this.resistanceChartData,
        options: {
          responsive: true,
        }
      });
    }    

  }

  private getUserWorkouts(pageSize: number = 500): void {
    this._workoutService.getFilteredSubset(0, pageSize, true)
      .pipe(finalize(() => { this.loadingData = false; }))
      .subscribe((result: PaginatedResults<WorkoutDTO>) => {
        this.workouts = sortBy(result.results, 'name');
      });
  }

  private clearAnalyticsData(): void {
    this.formAndRangeOfMotionChartData = null;
    this.repsChartData = null;
    this.resistanceChartData = null;
  }

  private buildForm(builder: FormBuilder): FormGroup<IWorkoutProgressForm> {
    const form = builder.group<IWorkoutProgressForm>({
      workoutId: new FormControl<string | null>(null, Validators.required),
      workoutCount: new FormControl<number>(this.DEFAULT_WORKOUT_COUNT, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      exerciseId: new FormControl<string | null>(null, Validators.required)
    });

    this._workoutId$ = form.controls.workoutId.valueChanges.subscribe(value => this.workoutIdChanged(value));
    this._workoutCount$ = form.controls.workoutCount.valueChanges.subscribe(value => this.workoutCountChanged(value));
    this._exerciseId$ = form.controls.exerciseId.valueChanges.subscribe(value => this.exerciseChanged(value));

    return form;
  }

  private workoutIdChanged(publicId: string | null): void {
    if (!publicId) return;

    this.loadingData = true;
    this.metrics = [];
    this.clearAnalyticsData();

    this._analyticsService.getExecutedWorkoutMetrics(publicId, this.form.controls.workoutCount.value)
      .pipe(
        finalize(() => {
          this.loadingData = false;
        })
      )
      .subscribe((results: ExecutedWorkoutMetrics[]) => {
        this.metrics = results;
      });
  }

  private workoutCountChanged(count: number | null): void {
    this.clearAnalyticsData();
    this.metrics = [];
    if (this.form.controls.workoutId.value) {
      this.getMetrics(this.form.controls.workoutId.value);
      this.form.controls.exerciseId.setValue(null);
    }
  }

  private exerciseChanged(id: string | null): void {
    if (!id) return;
    this.setupChartData(id);
  }
}
