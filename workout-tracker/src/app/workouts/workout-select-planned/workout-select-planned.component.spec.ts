import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../models/executed-workout-summary-dto';

import { WorkoutSelectPlannedComponent } from './workout-select-planned.component';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { HttpResponse } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { provideRouter } from '@angular/router';

class MockExecutedWorkoutService {
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

  deletePlanned =
    jasmine.createSpy('deletePlanned')
      .and.returnValue(of(new HttpResponse<any>()));
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

class MockConfirmationService {
  confirm =
    jasmine.createSpy('confirm')
      .and.callFake((confirmation: Confirmation) => {
        confirmation?.accept?.(); //Because confirmation could be undefined
      });
  //.and.returnValue(this);
}

describe('WorkoutSelectPlannedComponent', () => {
  let component: WorkoutSelectPlannedComponent;
  let fixture: ComponentFixture<WorkoutSelectPlannedComponent>;
  let executedWorkoutService: ExecutedWorkoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutSelectPlannedComponent],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useClass: MockExecutedWorkoutService
        },
        {
          provide: MessageService,
          useClass: MockMessageService
        },
        {
          provide: ConfirmationService,
          useClass: MockConfirmationService
        },
        provideRouter([])
      ]
    })
      .overrideComponent(
        WorkoutSelectPlannedComponent, 
        {
          remove: { imports: [ConfirmDialogModule] },
          add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        }
      )    
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
    component.getPlannedWorkoutsLazy({ first: 100 });

    //ASSERT
    expect(executedWorkoutService.getPlanned).toHaveBeenCalledWith(100, component.pageSize);
    expect(component.plannedWorkouts.length).toBeGreaterThan(0);
    expect(component.totalCount).toBeGreaterThan(0);
    expect(component.loading).toBeFalse();
  });

  it('should delete planned workouts', () => {
    //ARRANGE
    const confirmationService = TestBed.inject(ConfirmationService);
    const messageService = TestBed.inject(MessageService);

    //ACT
    component.deletePlannedWorkout('some-guid-100');

    //ASSERT
    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(messageService.add)
      .toHaveBeenCalledWith({ severity: 'success', summary: 'Successful', detail: 'Planned Workout deleted', life: 3000 });
  });
});
