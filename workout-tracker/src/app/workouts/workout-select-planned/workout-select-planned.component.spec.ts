import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO, PaginatedResultsOfExecutedWorkoutSummaryDTO } from '../../api';

import { WorkoutSelectPlannedComponent } from './workout-select-planned.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ModalOptions, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { type Mocked } from 'vitest';

describe('WorkoutSelectPlannedComponent', () => {
  let component: WorkoutSelectPlannedComponent;
  let fixture: ComponentFixture<WorkoutSelectPlannedComponent>;

  const executedWorkoutServiceMock: Mocked<Pick<ExecutedWorkoutService, 'getPlanned' | 'deletePlanned'>> = {
    getPlanned: vi.fn<ExecutedWorkoutService['getPlanned']>(() => {
      const response = <PaginatedResultsOfExecutedWorkoutSummaryDTO>{};
      response.results = new Array<ExecutedWorkoutSummaryDTO>();
      response.results.push(<ExecutedWorkoutSummaryDTO>{});
      response.results.push(<ExecutedWorkoutSummaryDTO>{});
      response.totalCount = 2;
      return of(response);
    }).mockName('getPlanned'),
    deletePlanned: vi.fn<ExecutedWorkoutService['deletePlanned']>(() => of(new HttpResponse<void>())).mockName('deletePlanned')
  };

  const nzMessageServiceMock: Mocked<Pick<NzMessageService, 'success'>> = {
    success: vi.fn<NzMessageService['success']>().mockName('success')
  };

  //NzModalService.confirm is a generic method, which Mocked<Pick<...>> can't represent, so this mock pins a non-generic signature instead.
  const nzModalServiceMock = {
    confirm: vi.fn<(options?: ModalOptions<unknown>) => NzModalRef>((options) => {
      if (options && typeof options.nzOnOk === 'function') {
        //return options.nzOnOk(); // Simulate the user confirming
        (options.nzOnOk as () => void)();
      }
      return <NzModalRef>{};
    }).mockName('confirm')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutSelectPlannedComponent],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useValue: executedWorkoutServiceMock
        },
        {
          provide: NzMessageService,
          useValue: nzMessageServiceMock
        },
        {
          provide: NzModalService,
          useValue: nzModalServiceMock
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

  afterEach(() => {
    vi.resetAllMocks();
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

    //ACT
    component.deletePlannedWorkout('some-guid-100');

    //ASSERT
    expect(nzModalServiceMock.confirm).toHaveBeenCalled();
    expect(nzMessageServiceMock.success).toHaveBeenCalledWith('Planned Workout deleted');
  });
});
