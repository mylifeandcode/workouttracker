import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutedWorkoutsSummary } from '../models/executed-workouts-summary';
import { of } from 'rxjs';

import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { AnalyticsService } from '../analytics.service';

class AnalyticsServiceMock {
  getExecutedWorkoutsSummary = 
    jasmine.createSpy('getExecutedWorkoutsSummary')
      .and.returnValue(of(<ExecutedWorkoutsSummary>{ totalLoggedWorkouts: 12, firstLoggedWorkoutDateTime: new Date(2022, 4, 5), targetAreasWithWorkoutCounts: new Map<string, number>()}));
}

describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;
  let fixture: ComponentFixture<AnalyticsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsDashboardComponent ],
      providers: [ 
        {
          provide: AnalyticsService,
          useClass: AnalyticsServiceMock
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
