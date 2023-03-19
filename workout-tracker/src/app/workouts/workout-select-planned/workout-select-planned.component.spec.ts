import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../models/executed-workout-summary-dto';

import { WorkoutSelectPlannedComponent } from './workout-select-planned.component';

class ExecutedWorkoutServiceMock {
  getPlanned = 
    jasmine.createSpy('getPlanned')
      .and.callFake(() => {
        const response = new PaginatedResults<ExecutedWorkoutSummaryDTO>();
        response.results = new Array<ExecutedWorkoutSummaryDTO>();
        response.results.push(new ExecutedWorkoutSummaryDTO());
        response.results.push(new ExecutedWorkoutSummaryDTO());
        response.totalCount = 2;
        return of(response);
      });
}

describe('WorkoutSelectPlannedComponent', () => {
  let component: WorkoutSelectPlannedComponent;
  let fixture: ComponentFixture<WorkoutSelectPlannedComponent>;
  let executedWorkoutService: ExecutedWorkoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutSelectPlannedComponent ], 
      providers: [
        {
          provide: ExecutedWorkoutService, 
          useClass: ExecutedWorkoutServiceMock
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSelectPlannedComponent);
    component = fixture.componentInstance;
    executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get planned workouts on init', () => {
    expect(executedWorkoutService.getPlanned).toHaveBeenCalledWith(0, component.pageSize);
    expect(component.plannedWorkouts.length).toBeGreaterThan(0);
    expect(component.totalCount).toBeGreaterThan(0);
    expect(component.loading).toBeFalse();
  });

  it('should get planned workouts via getPlannedLazy()', () => {
    //ARRANGE
    component.pageSize = 50; //Let's change this
    component.plannedWorkouts = [];
    component.totalCount = 0;

    //ACT
    component.getPlannedWorkoutsLazy({first: 100});

    //ASSERT
    expect(executedWorkoutService.getPlanned).toHaveBeenCalledWith(100, component.pageSize);
    expect(component.plannedWorkouts.length).toBeGreaterThan(0);
    expect(component.totalCount).toBeGreaterThan(0);
    expect(component.loading).toBeFalse();
  });
});
