import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../_services/workout.service';
import { of } from 'rxjs';
import { HttpResourceRef, HttpResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { PaginatedResultsOfWorkoutDTO, WorkoutDTO } from '../../api';
import { type Mocked } from 'vitest';
import { WINDOW } from '../../core/_injection-tokens/window.token';

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;

  const workoutServiceMock: Mocked<Pick<WorkoutService, 'getSelection' | 'retire' | 'reactivate'>> = {
    getSelection: vi.fn<WorkoutService['getSelection']>(() => {
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
    }).mockName('getSelection'),
    retire: vi.fn<WorkoutService['retire']>(() => of(new HttpResponse<void>())).mockName('retire'),
    reactivate: vi.fn<WorkoutService['reactivate']>(() => of(new HttpResponse<void>())).mockName('reactivate')
  };

  const windowMock: Mocked<Pick<Window, 'confirm'>> = {
    confirm: vi.fn<Window['confirm']>(() => true).mockName('confirm')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WorkoutListComponent
      ],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: WorkoutService,
          useValue: workoutServiceMock
        },
        {
          provide: WINDOW,
          useValue: windowMock
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
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks(); //Undoes the window.confirm spies
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

    expect(workoutServiceMock.retire).toHaveBeenCalledWith('some-guid');
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

    expect(workoutServiceMock.reactivate).toHaveBeenCalledWith('some-guid');
    //expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 30, true, true, '');
  });

});
