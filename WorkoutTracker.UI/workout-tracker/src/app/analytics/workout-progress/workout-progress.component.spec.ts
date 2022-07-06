import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { WorkoutService } from 'app/workouts/workout.service';
import { of } from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsChartData } from '../models/analytics-chart-data';

import { WorkoutProgressComponent } from './workout-progress.component';

class AnalyticsServiceMock {
  getExerciseChartData = jasmine.createSpy('getExerciseChartData')
    .and.returnValue(of(new AnalyticsChartData()));
}

class WorkoutServiceMock {
  getFilteredSubset = jasmine.createSpy('getFilteredSubset')
    .and.callFake(() => {
      const result = new PaginatedResults<WorkoutDTO>();
      result.results = [];
      result.totalCount = 0;
      return of(result);
    });
}

describe('WorkoutProgressComponent', () => {
  let component: WorkoutProgressComponent;
  let fixture: ComponentFixture<WorkoutProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutProgressComponent ],
      providers: [
        {
          provide: AnalyticsService,
          useClass: AnalyticsServiceMock
        },
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
