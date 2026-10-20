import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseListComponent } from './exercise-list.component';
import { ExerciseService } from '../_services/exercise.service';
import { TargetAreaService } from '../_services/target-area.service';
import { ExerciseDTO, PaginatedResultsOfExerciseDTO, TargetAreaDTO } from '../../api';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { type Mocked } from 'vitest';
import { HttpResourceRef } from '@angular/common/http';

describe('ExerciseListComponent', () => {
  let component: ExerciseListComponent;
  let fixture: ComponentFixture<ExerciseListComponent>;
  let targetAreaService: TargetAreaService;

  beforeEach(async () => {
    const ExerciseServiceMock: Mocked<Pick<ExerciseService, 'getSelection'>> = {
      getSelection: vi.fn<ExerciseService['getSelection']>().mockImplementation(() => {
        const paginatedResults: PaginatedResultsOfExerciseDTO = {
          totalCount: 0,
          results: <ExerciseDTO[]>[]
        };

        const mockResourceRef: Partial<HttpResourceRef<PaginatedResultsOfExerciseDTO>> = {
          value: signal(paginatedResults),
          //hasValue is a type predicate, which a plain mock function can't satisfy without a cast.
          hasValue: (() => true) as HttpResourceRef<PaginatedResultsOfExerciseDTO>['hasValue'],
          isLoading: signal(false),
        };

        return mockResourceRef as HttpResourceRef<PaginatedResultsOfExerciseDTO>;
      })
    };

    const TargetAreaServiceMock: Partial<Mocked<TargetAreaService>> = {
      getAll: vi.fn<TargetAreaService['getAll']>().mockReturnValue(of([
        <TargetAreaDTO>{ id: 1, name: 'Chest' },
        <TargetAreaDTO>{ id: 2, name: 'Biceps' },
        <TargetAreaDTO>{ id: 3, name: 'Triceps' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        ExerciseListComponent
      ],
      providers: [
        {
          provide: ExerciseService,
          useValue: ExerciseServiceMock
        },
        {
          provide: TargetAreaService,
          useValue: TargetAreaServiceMock
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
    targetAreaService = TestBed.inject(TargetAreaService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
  Reading value() on a resource whose request failed THROWS (ResourceValueError). The template used to do that, so a
  failed exercises request produced a second "Something went wrong" notification from the global error handler on top of
  the HTTP error one. This mock behaves like the real thing: value() throws, hasValue() is false.
  */
  it('should render without throwing, and without a total, when the exercises request has failed', () => {
    const failedResource: Partial<HttpResourceRef<PaginatedResultsOfExerciseDTO>> = {
      value: (() => { throw new Error('Resource is currently in an error state'); }) as unknown as HttpResourceRef<PaginatedResultsOfExerciseDTO>['value'],
      hasValue: (() => false) as HttpResourceRef<PaginatedResultsOfExerciseDTO>['hasValue'],
      isLoading: signal(false),
    };
    vi.mocked(TestBed.inject(ExerciseService).getSelection).mockReturnValue(failedResource as HttpResourceRef<PaginatedResultsOfExerciseDTO>);

    const failedFixture = TestBed.createComponent(ExerciseListComponent);

    expect(() => failedFixture.detectChanges()).not.toThrow();
    expect(failedFixture.nativeElement.textContent).not.toContain('total exercise(s)');
  });

  it('should populate target area filters from service', () => {
    expect(targetAreaService.getAll).toHaveBeenCalled();
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
