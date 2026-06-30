import { Component, ElementRef, OnInit, inject, viewChild, signal, computed, effect, afterRenderEffect, untracked, ChangeDetectionStrategy } from '@angular/core';
import { WorkoutDTO, PaginatedResultsOfWorkoutDTO } from '../../api';
import { WorkoutService } from '../../workouts/_services/workout.service';
import { finalize } from 'rxjs/operators';
import { AnalyticsService, METRICS_TYPE } from '../_services/analytics.service';
import { AnalyticsChartData } from '../_models/analytics-chart-data';
import { ExecutedWorkoutMetrics } from '../../api';
import { form, FormField, required, min } from '@angular/forms/signals';
import { SelectOnFocusDirective } from '../../shared/directives/select-on-focus.directive';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'wt-workout-progress',
  templateUrl: './workout-progress.component.html',
  styleUrls: ['./workout-progress.component.scss'],
  imports: [CommonModule, FormField, SelectOnFocusDirective, NzSpinModule, NzTabsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutProgressComponent implements OnInit {
  // Constants for magic numbers
  private static readonly DEFAULT_PAGE_SIZE = 500;
  private static readonly MIN_WORKOUT_COUNT = 1;
  private static readonly FORM_RATING_NA = 0;
  private static readonly FORM_RATING_BAD = 1;
  private static readonly FORM_RATING_POOR = 2;
  private static readonly FORM_RATING_OK = 3;
  private static readonly FORM_RATING_GOOD = 4;
  private static readonly FORM_RATING_EXCELLENT = 5;

  formAndRangeOfMotionChartCanvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('formAndRangeOfMotionChart');
  repsChartCanvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('repsChart');
  resistanceChartCanvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('resistanceChart');

  public loadingData = signal<boolean>(true);
  public metrics = signal<ExecutedWorkoutMetrics[]>([]);
  public formAndRangeOfMotionChartData = signal<AnalyticsChartData | null>(null);
  public repsChartData = signal<AnalyticsChartData | null>(null);
  public resistanceChartData = signal<AnalyticsChartData | null>(null);
  public workouts = signal<WorkoutDTO[]>([]);
  
  public readonly DEFAULT_WORKOUT_COUNT: number = 5;

  protected readonly model = signal({
    workoutId: '',   // '' = none (was null); native <select> is string-valued
    workoutCount: this.DEFAULT_WORKOUT_COUNT,
    exerciseId: ''   // '' = none
  });
  public readonly form = form(this.model, (p) => {
    required(p.workoutId);
    required(p.workoutCount);
    min(p.workoutCount, WorkoutProgressComponent.MIN_WORKOUT_COUNT);
    required(p.exerciseId);
  });

  //Fine-grained selectors so each reaction effect depends ONLY on its own field
  //(reading model() directly inside an effect would track the whole model).
  private readonly _workoutId = computed(() => this.model().workoutId);
  private readonly _workoutCount = computed(() => this.model().workoutCount);
  private readonly _exerciseId = computed(() => this.model().exerciseId);

  //SERVICES
  private _analyticsService = inject(AnalyticsService);
  private _workoutService = inject(WorkoutService);

  //PRIVATE VARIABLES
  private _formAndRangeOfMotionChart: Chart | null = null;
  private _repsChart: Chart | null = null;
  private _resistanceChart: Chart | null = null;

  private _formAndRangeOfMotionChartOptions: Partial<ChartOptions> = {
    scales: {
      y: {
        ticks: {
          callback: (tickValue) => {
            //TODO: Leverage RatingPipe for this
            switch (Number(tickValue)) {
              case WorkoutProgressComponent.FORM_RATING_NA:
                return 'N/A';
              case WorkoutProgressComponent.FORM_RATING_BAD:
                return 'Bad';
              case WorkoutProgressComponent.FORM_RATING_POOR:
                return 'Poor';
              case WorkoutProgressComponent.FORM_RATING_OK:
                return 'OK';
              case WorkoutProgressComponent.FORM_RATING_GOOD:
                return 'Good';
              case WorkoutProgressComponent.FORM_RATING_EXCELLENT:
                return 'Excellent';
              default:
                return '';
            }
          }
        }
      }
    }
  };

  constructor() {
    Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

    //Replaces the old valueChanges subscriptions; effects auto-dispose on destroy.
    //Track only the relevant field via the computed selector; run the handler untracked so its
    //model() reads/writes don't widen the dependency (which would make the effects stomp each other).
    effect(() => {
      const workoutId = this._workoutId();
      untracked(() => this.workoutIdChanged(workoutId));
    });
    effect(() => {
      this._workoutCount();
      untracked(() => this.workoutCountChanged());
    });
    //Chart rendering reads canvas layout and drives Chart.js (third-party DOM), so it must run
    //AFTER the DOM is rendered — otherwise the active tab's canvas is unsized and paints blank.
    afterRenderEffect(() => {
      const exerciseId = this._exerciseId();
      untracked(() => this.exerciseChanged(exerciseId));
    });
  }

  public ngOnInit(): void {
    this.getUserWorkouts(); //TODO: Specify number to get instead of default
  }

  private getMetrics(workoutPublicId: string): void {
    this.metrics.set([]);
    const count = this.model().workoutCount;

    this._analyticsService.getExecutedWorkoutMetrics(workoutPublicId, count)
      .pipe(
        finalize(() => {
          this.loadingData.set(false);
        })
      )
      .subscribe({
        next: (results: ExecutedWorkoutMetrics[]) => {
          this.metrics.set(results);
        }/*,
        error: (error) => {
          // TODO: Add user-friendly error notification service
          // console.error('Error loading workout metrics:', error);
        }*/
      });
  }

  private getChartData(exerciseId: string): void {
    this.formAndRangeOfMotionChartData.set(
      this._analyticsService
        .getExerciseChartData(this.metrics(), exerciseId, METRICS_TYPE.FormAndRangeOfMotion));

    this.repsChartData.set(
      this._analyticsService.getExerciseChartData(this.metrics(), exerciseId, METRICS_TYPE.Reps));

    this.resistanceChartData.set(
      this._analyticsService.getExerciseChartData(this.metrics(), exerciseId, METRICS_TYPE.Resistance));

    this._formAndRangeOfMotionChart = this.setupChart(
      this.formAndRangeOfMotionChartCanvasRef().nativeElement.getContext('2d'),
      this.formAndRangeOfMotionChartData(),
      this._formAndRangeOfMotionChart,
      this._formAndRangeOfMotionChartOptions.scales);

    this._repsChart = this.setupChart(
      this.repsChartCanvasRef().nativeElement.getContext('2d'),
      this.repsChartData(),
      this._repsChart);

    this._resistanceChart = this.setupChart(
      this.resistanceChartCanvasRef().nativeElement.getContext('2d'),
      this.resistanceChartData(), 
      this._resistanceChart);
  }

  private setupChart(
    canvas: CanvasRenderingContext2D | null, 
    chartData: AnalyticsChartData | null, 
    chartReference: Chart | null = null,
    scales?: Partial<ChartOptions>['scales']): Chart | null {

    if (!canvas || !chartData) return null;

    if(chartReference) {
      chartReference.destroy();
    }

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      ...(scales ? { scales } : {}),
      plugins: {
          legend: {
            display: true,
            position: 'top', // 'top' is default
          }
        }      
    };

    return new Chart(canvas, {
      type: 'line',
      data: chartData,
      options
    });
  }

  private getUserWorkouts(pageSize: number = WorkoutProgressComponent.DEFAULT_PAGE_SIZE): void {
    this._workoutService.getFilteredSubset(0, pageSize, true)
      .pipe(finalize(() => { this.loadingData.set(false); }))
      .subscribe({
        next: (result: PaginatedResultsOfWorkoutDTO) => {
          this.workouts.set(result.results.sort((a, b) => a.name.localeCompare(b.name)));
        }/*,
        error: (error) => {
          // TODO: Add user-friendly error notification service
          // console.error('Error loading workouts:', error);
        }*/
      });
  }

  private clearAnalyticsData(): void {
    this.formAndRangeOfMotionChartData.set(null);
    this.repsChartData.set(null);
    this.resistanceChartData.set(null);
  }

  private workoutIdChanged(publicId: string): void {
    if (!publicId) return;

    this.loadingData.set(true);
    this.metrics.set([]);
    this.clearAnalyticsData();

    this._analyticsService.getExecutedWorkoutMetrics(publicId, this.model().workoutCount)
      .pipe(
        finalize(() => {
          this.loadingData.set(false);
        })
      )
      .subscribe({
        next: (results: ExecutedWorkoutMetrics[]) => {
          this.metrics.set(results);
          this.resetSelectedExercise();
        }/*,
        error: (error) => {
          // TODO: Add user-friendly error notification service
          // console.error('Error loading workout metrics:', error);
        }*/
      });
  }

  private workoutCountChanged(): void {
    this.clearAnalyticsData();
    this.metrics.set([]);
    if (this.model().workoutId) {
      this.getMetrics(this.model().workoutId);
      this.resetSelectedExercise();
    }
  }

  //Only writes when there's actually a change, so the reaction effects don't re-trigger on a no-op model update.
  private resetSelectedExercise(): void {
    if (this.model().exerciseId !== '')
      this.model.update(m => ({ ...m, exerciseId: '' }));
  }

  private exerciseChanged(id: string): void {
    if (!id) return;
    this.getChartData(id);
  }
}
