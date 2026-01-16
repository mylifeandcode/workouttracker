import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { of } from 'rxjs';
import { ExerciseDTO } from '../workouts/_models/exercise-dto';
import { TargetArea } from '../workouts/_models/target-area';
import { ExerciseListBase } from './exercise-list-base';
import { Component, inject as inject_1 } from '@angular/core';
import { PaginatedResults } from '../core/_models/paginated-results';
import { ExerciseService } from './_services/exercise.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { HttpResourceRef } from '@angular/common/http';
import { MockedFunction } from 'vitest';

class ExerciseServiceMock {
  get = vi.fn().mockImplementation(() => {

      const paginatedResults = new PaginatedResults<ExerciseDTO>();
      paginatedResults.totalCount = 0;
      paginatedResults.results = new Array<ExerciseDTO>();

      const mockResourceRef: Partial<HttpResourceRef<PaginatedResults<ExerciseDTO>>> = {
        value: signal(paginatedResults),
        isLoading: signal(false),
      };      

      return mockResourceRef
  });
  getTargetAreas = vi.fn().mockImplementation(() => {
    const targetAreas = new Array<TargetArea>();
    targetAreas.push(new TargetArea(1, "Chest", 1, new Date(), null, null, false));
    targetAreas.push(new TargetArea(2, "Biceps", 1, new Date(), null, null, false));
    targetAreas.push(new TargetArea(3, "Triceps", 1, new Date(), null, null, false));
    return of(targetAreas);
  });
}

//We're testing an abstract base class, so let's create a class here that extends it
@Component({
  template: '',
  imports: []
})
class ExerciseListBaseExtenderComponent extends ExerciseListBase {
  private _exerciseService: ExerciseService;

  constructor() {
    const _exerciseService = inject_1(ExerciseService);

    super();
    this._exerciseService = _exerciseService;

  }
}

describe('ExerciseListBaseComponent', () => {
  let component: ExerciseListBaseExtenderComponent;
  let fixture: ComponentFixture<ExerciseListBaseExtenderComponent>;
  let exerciseService: ExerciseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ExerciseService,
          useClass: ExerciseServiceMock
        },
        provideZonelessChangeDetection()
      ],
      imports: [
        ExerciseListBaseExtenderComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListBaseExtenderComponent);
    component = fixture.componentInstance;
    exerciseService = TestBed.inject(ExerciseService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get target areas', () => {
    //This currently happens in the constructor, but should be moved to ngOnInit
    //TODO: Expand this test, make it better
    expect(exerciseService.getTargetAreas).toHaveBeenCalled();
    expect(component.targetAreas().length).toBe(3);
  });

  it.only('should get exercises', () => {

    //ARRANGE
    const params: Partial<NzTableQueryParams> = {
      "pageIndex": 1,
      "pageSize": 10
    };

    //ACT
    component.updateQueryParams(params as NzTableQueryParams);
    component.targetAreasFilterChange(["Chest"]);    

    //ASSERT
    expect(exerciseService.get)
      .toHaveBeenCalledWith(
        component.firstRecordOffset, 
        component.pageSize, 
        expect.any(Function), 
        expect.any(Function));

    const callArgs = (exerciseService.get as MockedFunction<typeof exerciseService.get>).mock.calls[0];
    expect(callArgs[2]()).toBe(undefined); // nameFilter value
    expect(callArgs[3]()).toEqual(["Chest"]); // targetAreas value

  });
});
