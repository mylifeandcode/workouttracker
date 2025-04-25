import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';

import { WorkoutSelectPlannedComponent } from './workout-select-planned.component';
import { Confirmation, ConfirmationService } from 'primeng/api';
import { NzMessageService } from 'ng-zorro-antd/message';
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

class MockNzMessageService {
  success = jasmine.createSpy('success');
}

class MockConfirmationService {
  confirm =
    jasmine.createSpy('confirm')
      .and.callFake((confirmation: Confirmation) => {
        confirmation?.accept?.(); //Because confirmation could be undefinedd
      });
  //.and.returnValue(this);
}

//TODO: Need to revisit. PrimeNG lazy loading on table is affecting this.
xdescribe('WorkoutSelectPlannedComponent', () => {
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
          provide: NzMessageService,
          useClass: MockNzMessageService
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
    component.loading = false; //HACK: Workaround for PrimeNG change that kicks off lazy loading immediately. If this value isn't defaulted to true in the component, at runtime I get https://angular.dev/errors/NG0100
    executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
  it('should get planned workouts on init', () => {
    expect(executedWorkoutService.getPlanned).toHaveBeenCalledWith(0, component.pageSize);
    expect(component.plannedWorkouts.length).toBeGreaterThan(0);
    expect(component.totalCount).toBeGreaterThan(0);
    expect(component.loading).toBeFalse();
  });
  */

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
    const messageService = TestBed.inject(NzMessageService);

    //ACT
    component.deletePlannedWorkout('some-guid-100');

    //ASSERT
    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(messageService.success).toHaveBeenCalledWith('Planned Workout deleted');
  });
});
