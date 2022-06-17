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

  public getExecutedWorkoutMetrics(workoutId: number, count: number = 5): Observable<ExecutedWorkoutMetrics[]> {
    return this._http.get<ExecutedWorkoutMetrics[]>(`${this.API_ROOT}/workout-metrics/${workoutId}/${count}`);
  }

  public getChartData(metrics: ExecutedWorkoutMetrics[]): AnalyticsChartData {
    let chartData = new AnalyticsChartData();
    
    //Example data
    /*
    this.chartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
          {
              label: 'First Dataset',
              data: [65, 59, 80, 81, 56, 55, 40],
              borderColor: '#42A5F5'
          },
          {
              label: 'Second Dataset',
              data: [28, 48, 40, 19, 86, 27, 90],
              borderColor: '#FFA726'
          }
      ]
    };
    */    

    if(metrics) {

      /*
      Overall ChartData labels should be the dates
      In the ChartData.dataSets, we should have:
      - One dataset per exercise that appears in the workout
      - The data of each of this should be an array of objects containing the metrics values
      */

      //Set up the labels
      metrics.forEach((executedWorkoutMetrics: ExecutedWorkoutMetrics) => {
        chartData.labels?.push(new Date(executedWorkoutMetrics.endDateTime).toDateString());
        //Example data
        /*
        chartData.datasets.push({
          label: 'First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: '#42A5F5'
        });
        */
       /*
       chartData.datasets.push(...executedWorkoutMetrics.exerciseMetrics.map((exerciseMetrics: ExecutedExerciseMetrics, index: number) => {
        return {
          label: exerciseMetrics.name,
          data: [exerciseMetrics.averageForm, exerciseMetrics.averageRangeOfMotion, exerciseMetrics.averageRepCount, exerciseMetrics.averageResistanceAmount],
          borderColor: (index < 10 ? this.BORDERCOLORS[index] : this.BORDERCOLORS[index-10])
        }
       }));
       */
      });

      //Set up the dataSets
      metrics[0].exerciseMetrics.forEach((exercise: ExecutedExerciseMetrics, index: number) => {
        chartData.datasets.push({
          label: exercise.name,
          data: [1,2,3,4,5], //TODO: Implement
          borderColor: (index < 10 ? this.BORDERCOLORS[index] : this.BORDERCOLORS[index-10])
        });
      });
    }

    //console.log("chartData: ", chartData);

    return chartData;
  }
}
