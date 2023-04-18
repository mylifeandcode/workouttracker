import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'app/core/config.service';
import { Observable } from 'rxjs';
import { AnalyticsChartData } from './models/analytics-chart-data';
import { ExecutedExerciseMetrics } from './models/executed-exercise-metrics';
import { ExecutedWorkoutMetrics } from './models/executed-workout-metrics';
import { ExecutedWorkoutsSummary } from './models/executed-workouts-summary';

//TODO: This service doesn't fit the normal API service pattern due to different types, not just 
//a single entity type. Find a way to eliminate duplicate setup code and allow for caching.

const HTTP_OPTIONS = { 
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

enum CHART_DATA_TYPE {
  Form,
  RangeOfMotion,
  Reps,
  Resistance
}

export enum METRICS_TYPE {
  FormAndRangeOfMotion,
  Reps,
  Resistance
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_ROOT: string;
  private readonly BORDERCOLORS: string[] = 
    [
      "#0000FF", //Blue
      "#8A2BE2", //Blue Violet
      "#DC143C", //Crimson
      "#00008B", //Dark Blue
      "#006400", //Dark Green
      "#FF1493", //Deep Pink
      "#DAA520", //Goldenrod
      "#7CFC00", //Lawn Green
      "#778899", //Light Slate Grey
      "#FF0000"  //Red
    ];

  constructor(private _http: HttpClient, private _configService: ConfigService) { 
    const apiRoot: string = this._configService.get("apiRoot");
    this.API_ROOT = apiRoot + "analytics";
  }

  public getExecutedWorkoutsSummary(): Observable<ExecutedWorkoutsSummary> {
    return this._http.get<ExecutedWorkoutsSummary>(`${this.API_ROOT}/executed-workouts`);
  }

  public getExecutedWorkoutMetrics(workoutId: number, count: number = 10): Observable<ExecutedWorkoutMetrics[]> {
    return this._http.get<ExecutedWorkoutMetrics[]>(`${this.API_ROOT}/workout-metrics/${workoutId}/${count}`);
  }

  public getExerciseChartData(metrics: ExecutedWorkoutMetrics[], exerciseId: number, metricsType: METRICS_TYPE): AnalyticsChartData {
    const chartData = new AnalyticsChartData();

    if(metrics) {
      //Set up the labels
      this.setupAnalyticsChartDataLabels(metrics, chartData);

      //Set up the datasets

      switch(metricsType) {
        case METRICS_TYPE.FormAndRangeOfMotion:
          chartData.datasets.push({
            label: 'Average Form Rating',
            data: this.getFlattenedExerciseMetrices(metrics, exerciseId, CHART_DATA_TYPE.Form),
            borderColor: this.BORDERCOLORS[0] //Blue
          });
  
          chartData.datasets.push({
            label: 'Average Range of Motion Rating',
            data: this.getFlattenedExerciseMetrices(metrics, exerciseId, CHART_DATA_TYPE.RangeOfMotion),
            borderColor: this.BORDERCOLORS[6] //Goldenrod
          });
          
          break;

        case METRICS_TYPE.Reps:
          chartData.datasets.push({
            label: 'Average Rep Count',
            data: this.getFlattenedExerciseMetrices(metrics, exerciseId, CHART_DATA_TYPE.Reps),
            borderColor: this.BORDERCOLORS[7] //Lawn Green
          });
    
          break;

        case METRICS_TYPE.Resistance:
          chartData.datasets.push({
            label: 'Average Resistance Amount',
            data: this.getFlattenedExerciseMetrices(metrics, exerciseId, CHART_DATA_TYPE.Resistance),
            borderColor: this.BORDERCOLORS[9] //Red
          });
    
          break;
      }
    }
    
    return chartData;

  }

  private setupAnalyticsChartDataLabels(metrics: ExecutedWorkoutMetrics[], chartData: AnalyticsChartData): void {
    metrics.forEach((executedWorkoutMetrics: ExecutedWorkoutMetrics) => {
      chartData.labels?.push(new Date(executedWorkoutMetrics.endDateTime).toDateString());
    });
  }

  private getFlattenedExerciseMetrices(metrics: ExecutedWorkoutMetrics[], exerciseId: number, chartDataType: CHART_DATA_TYPE = CHART_DATA_TYPE.Resistance): number[] {
    return metrics.flatMap((metric: ExecutedWorkoutMetrics) => metric.exerciseMetrics.filter((executedExerciseMetrics: ExecutedExerciseMetrics) => executedExerciseMetrics.exerciseId == exerciseId).map((executedExerciseMetrics: ExecutedExerciseMetrics) => {
      switch(chartDataType) {
        case CHART_DATA_TYPE.Form:
          return executedExerciseMetrics.averageForm;
        case CHART_DATA_TYPE.RangeOfMotion:
          return executedExerciseMetrics.averageRangeOfMotion;
        case CHART_DATA_TYPE.Reps:
          return executedExerciseMetrics.averageRepCount;
        case CHART_DATA_TYPE.Resistance:
          return executedExerciseMetrics.averageResistanceAmount;
        default:
          throw new Error("UNKNOWN CHART DATA TYPE");
      }
    }));
  }
}
