import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseListComponent } from './exercise-list.component';
import { ExerciseService } from '../_services/exercise.service';
import { TargetAreaService } from '../_services/target-area.service';
import { ExerciseDTO, PaginatedResultsOfExerciseDTO, TargetAreaDTO } from '../../api';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { type Mocked } from 'vitest';
import { HttpResourceRef } from '@angular/common/http';

describe('ExerciseListComponent', () => {
  let component: ExerciseListComponent;
  let fixture: ComponentFixture<ExerciseListComponent>;

  const exerciseServiceMock: Mocked<Pick<ExerciseService, 'getSelection'>> = {
    getSelection: vi.fn<ExerciseService['getSelection']>(() => {
      const paginatedResults: PaginatedResultsOfExerciseDTO = {
        totalCount: 0,
        results: <ExerciseDTO[]>[]
      };

      const mockResourceRef: Partial<HttpResourceRef<PaginatedResultsOfExerciseDTO>> = {
        value: signal(paginatedResults),
        isLoading: signal(false),
      };

      return mockResourceRef as HttpResourceRef<PaginatedResultsOfExerciseDTO>;
    }).mockName('getSelection')
  };

  const targetAreaServiceMock: Mocked<Pick<TargetAreaService, 'getAll'>> = {
    getAll: vi.fn<TargetAreaService['getAll']>(() => of([
      <TargetAreaDTO>{ id: 1, name: 'Chest' },
      <TargetAreaDTO>{ id: 2, name: 'Biceps' },
      <TargetAreaDTO>{ id: 3, name: 'Triceps' }
    ])).mockName('getAll')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExerciseListComponent
      ],
      providers: [
        provideRouter([]),
        {
          provide: ExerciseService,
          useValue: exerciseServiceMock
        },
        {
          provide: TargetAreaService,
          useValue: targetAreaServiceMock
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
    //qexerciseService = TestBed.inject(ExerciseService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate target area filters from service', () => {
    expect(targetAreaServiceMock.getAll).toHaveBeenCalled();
    expect(component.targetAreaFilters()).toEqual([
      { text: 'Chest', value: 'Chest' },
      { text: 'Biceps', value: 'Biceps' },
      { text: 'Triceps', value: 'Triceps' }
    ]);
  });

  it.skip('should reset page index to 1 when target area filter changes', () => {
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
    //expect(component.pageIndex()).toBe(1);
    //TODO: FIX
  });

  //TODO: Add HttpResourceRef verification tests

});
