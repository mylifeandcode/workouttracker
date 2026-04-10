import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO, ExecutedWorkoutSummaryDTOPaginatedResults } from '../../api';

import { WorkoutSelectPlannedComponent } from './workout-select-planned.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ModalOptions, NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { type Mocked } from 'vitest';

describe('WorkoutSelectPlannedComponent', () => {
  let component: WorkoutSelectPlannedComponent;
  let fixture: ComponentFixture<WorkoutSelectPlannedComponent>;

  beforeEach(async () => {
    const MockExecutedWorkoutService: Partial<Mocked<ExecutedWorkoutService>> = {
      getPlanned: vi.fn().mockImplementation(() => {
        const response = <ExecutedWorkoutSummaryDTOPaginatedResults>{};
        response.results = new Array<ExecutedWorkoutSummaryDTO>();
        response.results.push(<ExecutedWorkoutSummaryDTO>{});
        response.results.push(<ExecutedWorkoutSummaryDTO>{});
        response.totalCount = 2;
        return of(response);
      }),
      deletePlanned: vi.fn().mockReturnValue(of(new HttpResponse<void>()))
    };

    const MockNzMessageService: Partial<Mocked<NzMessageService>> = {
      success: vi.fn()
    };

    const MockNzModalService: Partial<Mocked<NzModalService>> = {
      confirm: vi.fn().mockImplementation((options: ModalOptions) => {
        if (options && typeof options.nzOnOk === 'function') {
          //return options.nzOnOk(); // Simulate the user confirming
          return (options.nzOnOk as () => void)();
        }
      })
    };

    await TestBed.configureTestingModule({
      imports: [WorkoutSelectPlannedComponent],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useValue: MockExecutedWorkoutService
        },
        {
          provide: NzMessageService,
          useValue: MockNzMessageService
        },
        {
          provide: NzModalService,
          useValue: MockNzModalService
        },
        provideRouter([]),
        provideZonelessChangeDetection()
      ]
    })
      .overrideComponent(WorkoutSelectPlannedComponent, {
        remove: { imports: [NzTableModule, NzModalModule] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSelectPlannedComponent);
    component = fixture.componentInstance;
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

  it('should delete planned workouts', () => {
    //ARRANGE
    const confirmationService = TestBed.inject(NzModalService);
    const messageService = TestBed.inject(NzMessageService);

    //ACT
    component.deletePlannedWorkout('some-guid-100');

    //ASSERT
    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(messageService.success).toHaveBeenCalledWith('Planned Workout deleted');
  });
});
