import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../_services/workout.service';
import { of } from 'rxjs';
import { HttpResourceRef, HttpResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { PaginatedResultsOfWorkoutDTO, WorkoutDTO } from '../../api';
import { type Mocked } from 'vitest';

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;
  let workoutService: WorkoutService;

  beforeEach(async () => {
    const WorkoutServiceMock: Mocked<Pick<WorkoutService, 'getSelection' | 'retire' | 'reactivate'>> = {
      getSelection: vi.fn<WorkoutService['getSelection']>().mockImplementation(() => {
        const paginatedResults: PaginatedResultsOfWorkoutDTO = {
          totalCount: 0,
          results: <WorkoutDTO[]>[]
        };

        const mockResourceRef: Partial<HttpResourceRef<PaginatedResultsOfWorkoutDTO>> = {
          value: signal(paginatedResults),
          isLoading: signal(false),
          reload: vi.fn()
        };

        return mockResourceRef as HttpResourceRef<PaginatedResultsOfWorkoutDTO>;
      }),
      retire: vi.fn<WorkoutService['retire']>().mockReturnValue(of(new HttpResponse<void>())),
      reactivate: vi.fn<WorkoutService['reactivate']>().mockReturnValue(of(new HttpResponse<void>()))
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        WorkoutListComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: WorkoutService,
          useValue: WorkoutServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    workoutService = TestBed.inject(WorkoutService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retire a workout and refresh with current filters', () => {
    component.onQueryParamsChange({
      pageIndex: 1,
      pageSize: 15,
      sort: [{ key: 'name', value: 'descend' }],
      filter: [{ key: 'active', value: [] }]
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.retireWorkout('some-guid', 'My Workout');

    expect(workoutService.retire).toHaveBeenCalledWith('some-guid');
    //expect(workoutService.getSelection).toHaveBeenCalledWith(0, 15, false, false, '');
  });

  it('should reactivate a workout and refresh with current filters', () => {
    component.onQueryParamsChange({
      pageIndex: 1,
      pageSize: 30,
      sort: [{ key: 'name', value: 'ascend' }],
      filter: [{ key: 'active', value: ['ActiveOnly'] }]
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.reactivateWorkout('some-guid', 'My Workout');

    expect(workoutService.reactivate).toHaveBeenCalledWith('some-guid');
    //expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 30, true, true, '');
  });

});
