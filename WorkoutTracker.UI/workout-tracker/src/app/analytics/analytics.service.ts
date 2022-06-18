import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'app/core/config.service';
import { BubbleDataPoint, ScatterDataPoint } from 'chart.js';
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

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_ROOT: string;
  private readonly BORDERCOLORS: string[] = 
    [
      "#0000FF",
      "#8A2BE2",
      "#DC143C",
      "#00008B",
      "#006400",
      "#FF1493",
      "#DAA520",
      "#7CFC00",
      "#778899",
      "#FF0000"
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

  public getChartData(metrics: ExecutedWorkoutMetrics[], chartDataType: CHART_DATA_TYPE = CHART_DATA_TYPE.Resistance): AnalyticsChartData {
    let chartData = new AnalyticsChartData();

    if(metrics) {

      //Set up the labels
      metrics.forEach((executedWorkoutMetrics: ExecutedWorkoutMetrics) => {
        chartData.labels?.push(new Date(executedWorkoutMetrics.endDateTime).toDateString());
      });

      //Set up the dataSets
      metrics[0].exerciseMetrics.forEach((exercise: ExecutedExerciseMetrics, index: number) => {
        chartData.datasets.push({
          label: exercise.name,
          data: metrics.flatMap((metric: ExecutedWorkoutMetrics) => metric.exerciseMetrics.filter((executedExerciseMetrics: ExecutedExerciseMetrics) => executedExerciseMetrics.name == exercise.name).map((executedExerciseMetrics: ExecutedExerciseMetrics) => {
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
          })),
          borderColor: (index < 10 ? this.BORDERCOLORS[index] : this.BORDERCOLORS[index-10])
        });
      });
    }

    return chartData;
  }
}
