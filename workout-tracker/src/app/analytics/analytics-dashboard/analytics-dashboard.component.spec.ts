import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutedWorkoutsSummary } from '../_models/executed-workouts-summary';
import { of } from 'rxjs';

import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { AnalyticsService } from '../_services/analytics.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

class AnalyticsServiceMock {
  getExecutedWorkoutsSummary =
    jasmine.createSpy('getExecutedWorkoutsSummary')
      .and.returnValue(of(<ExecutedWorkoutsSummary>{
        totalLoggedWorkouts: 12,
        firstLoggedWorkoutDateTime: new Date(2022, 4, 5),
        targetAreasWithWorkoutCounts: new Map<string, number>([
          ['Chest', 2],
          ['Back', 3],
          ['Legs', 5],
          ['Arms', 2]
        ])
      }));
}

describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;
  let fixture: ComponentFixture<AnalyticsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsDashboardComponent],
      providers: [
        {
          provide: AnalyticsService,
          useClass: AnalyticsServiceMock
        }
      ]
    })
      .overrideComponent(
        AnalyticsDashboardComponent,
        {
          remove: { imports: [NzSpinModule] },
          add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        }
      )
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

  it('should get analytics data when initializing', () => {
    const analyticsService = TestBed.inject(AnalyticsService);
    expect(analyticsService.getExecutedWorkoutsSummary).toHaveBeenCalledTimes(1);
    expect(component.executedWorkoutsSummary()).not.toBeUndefined();
    expect(component.gettingData()).toBeFalse();
  });
});
