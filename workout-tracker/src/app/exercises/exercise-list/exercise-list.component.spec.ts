import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseListComponent } from './exercise-list.component';
import { ExerciseService } from '../_services/exercise.service';
import { ExerciseDTOPaginatedResults, TargetArea } from '../../api';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

class ExerciseServiceMock {
  getAll = vi.fn().mockReturnValue(of(<ExerciseDTOPaginatedResults>{ results: [], totalCount: 0 }));
  getTargetAreas = vi.fn().mockReturnValue(of([
    <TargetArea>{ id: 1, name: 'Chest' },
    <TargetArea>{ id: 2, name: 'Biceps' },
    <TargetArea>{ id: 3, name: 'Triceps' }
  ]));
}

describe('ExerciseListComponent', () => {
  let component: ExerciseListComponent;
  let fixture: ComponentFixture<ExerciseListComponent>;
  let exerciseService: ExerciseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        ExerciseListComponent
      ],
      providers: [
        {
          provide: ExerciseService,
          useClass: ExerciseServiceMock
        },
        provideZonelessChangeDetection()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    exerciseService = TestBed.inject(ExerciseService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate target area filters from service', () => {
    expect(exerciseService.getTargetAreas).toHaveBeenCalled();
    expect(component.targetAreaFilters()).toEqual([
      { text: 'Chest', value: 'Chest' },
      { text: 'Biceps', value: 'Biceps' },
      { text: 'Triceps', value: 'Triceps' }
    ]);
  });

  it('should get exercises on query params change', () => {
    //ARRANGE
    const queryParams: NzTableQueryParams = {
      pageIndex: 1,
      pageSize: 10,
      sort: [],
      filter: []
    };

    //ACT
    component.onQueryParamsChange(queryParams);

    //ASSERT
    expect(exerciseService.getAll).toHaveBeenCalledWith(0, 10, '', null);
  });

  it('should pass target area filters from query params', () => {
    //ARRANGE
    const queryParams: NzTableQueryParams = {
      pageIndex: 1,
      pageSize: 10,
      sort: [],
      filter: [{ key: 'targetAreas', value: ['Chest', 'Biceps'] }]
    };

    //ACT
    component.onQueryParamsChange(queryParams);

    //ASSERT
    expect(exerciseService.getAll).toHaveBeenCalledWith(0, 10, '', ['Chest', 'Biceps']);
  });

  it('should search with current name filter', () => {
    //ACT
    component.search();

    //ASSERT
    expect(exerciseService.getAll).toHaveBeenCalledWith(0, 10, '', null);
  });

  it('should reset name filter and search', () => {
    //ACT
    component.reset();

    //ASSERT
    expect(exerciseService.getAll).toHaveBeenCalledWith(0, 10, '', null);
  });

  it('should reset page index to 1 when target area filter changes', () => {
    //ARRANGE
    const queryParams1: NzTableQueryParams = {
      pageIndex: 2,
      pageSize: 10,
      sort: [],
      filter: [{ key: 'targetAreas', value: ['Chest'] }]
    };

    const queryParams2: NzTableQueryParams = {
      pageIndex: 2,
      pageSize: 10,
      sort: [],
      filter: [{ key: 'targetAreas', value: ['Biceps'] }]
    };

    //ACT
    component.onQueryParamsChange(queryParams1);
    component.onQueryParamsChange(queryParams2);

    //ASSERT
    expect(component.pageIndex()).toBe(1);
  });
  
});
