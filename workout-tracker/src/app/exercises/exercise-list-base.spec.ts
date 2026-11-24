import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { of } from 'rxjs';
import { ExerciseListBase } from './exercise-list-base';
import { Component, inject as inject_1 } from '@angular/core';
import { ExerciseService } from './_services/exercise.service';
import { TargetAreaService } from './_services/target-area.service';
import { PaginatedResultsOfExerciseDTO, TargetAreaDTO } from '../api';
import { type Mocked } from 'vitest';

//We're testing an abstract base class, so let's create a class here that extends it
@Component({
  template: '',
  imports: []
})
class ExerciseListBaseExtenderComponent extends ExerciseListBase {
  private _exerciseService: ExerciseService;

  constructor() {
    const _exerciseService = inject_1(ExerciseService);

    super(_exerciseService);
    this._exerciseService = _exerciseService;

  }
}

describe('ExerciseListBaseComponent', () => {
  let component: ExerciseListBaseExtenderComponent;
  let fixture: ComponentFixture<ExerciseListBaseExtenderComponent>;

  const exerciseServiceMock: Mocked<Pick<ExerciseService, 'getAll'>> = {
    getAll: vi.fn<ExerciseService['getAll']>(() => of(<PaginatedResultsOfExerciseDTO>{})).mockName('getAll')
  };

  const targetAreaServiceMock: Mocked<Pick<TargetAreaService, 'getAll'>> = {
    getAll: vi.fn<TargetAreaService['getAll']>(() => {
      const targetAreas: TargetAreaDTO[] = [
        { id: 1, name: "Chest" },
        { id: 2, name: "Biceps" },
        { id: 3, name: "Triceps" }
      ];
      return of(targetAreas);
    }).mockName('getAll')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
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
      imports: [
        ExerciseListBaseExtenderComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListBaseExtenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get target areas', () => {
    //This currently happens in the constructor, but should be moved to ngOnInit
    //TODO: Expand this test, make it better
    expect(targetAreaServiceMock.getAll).toHaveBeenCalled();
    expect(component.targetAreas().length).toBe(3);
  });

  it('should get exercises', () => {

    //ARRANGE

    //ACT
    component.getExercises(10, "blah", ["Chest"]);

    //ASSERT
    expect(exerciseServiceMock.getAll).toHaveBeenCalledWith(10, component.pageSize(), "blah", ["Chest"]);

  });
});
