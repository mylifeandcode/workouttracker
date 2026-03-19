import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../_services/workout.service';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { WorkoutDTOPaginatedResults } from '../../api';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

class WorkoutServiceMock {
  getFilteredSubset = vi.fn().mockReturnValue(of(<WorkoutDTOPaginatedResults>{}));
  retire = vi.fn().mockReturnValue(of(new HttpResponse<void>()));
  reactivate = vi.fn().mockReturnValue(of(new HttpResponse<void>()));
}

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;
  let workoutService: WorkoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        WorkoutListComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
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

  it('should query workouts using table params', () => {
    const params: NzTableQueryParams = {
      pageIndex: 2,
      pageSize: 25,
      sort: [{ key: 'name', value: 'descend' }],
      filter: [{ key: 'active', value: ['ActiveOnly'] }]
    };

    component.onQueryParamsChange(params);

    expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(25, 25, true, false, '');
  });

  it('should search using current table state and reset to first page', () => {
    component.onQueryParamsChange({
      pageIndex: 2,
      pageSize: 20,
      sort: [{ key: 'name', value: 'descend' }],
      filter: [{ key: 'active', value: [] }]
    });

    component.search();

    expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 20, false, false, '');
  });

  it('should reset and search using the current table state', () => {
    component.onQueryParamsChange({
      pageIndex: 3,
      pageSize: 20,
      sort: [{ key: 'name', value: 'descend' }],
      filter: [{ key: 'active', value: [] }]
    });

    component.reset();

    expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 20, false, false, '');
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
    expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 15, false, false, '');
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
    expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 30, true, true, '');
  });

});
