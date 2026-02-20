import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { of } from 'rxjs';
import { ExerciseListBase } from './exercise-list-base';
import { Component, inject as inject_1 } from '@angular/core';
import { ExerciseService } from './_services/exercise.service';
import { ExerciseDTOPaginatedResults, TargetArea } from '../api';

class ExerciseServiceMock {
  getAll = vi.fn().mockReturnValue(of(<ExerciseDTOPaginatedResults>{}));
  getTargetAreas = vi.fn().mockImplementation(() => {
    const targetAreas = new Array<TargetArea>();
    targetAreas.push(<TargetArea>{ id: 1, name: "Chest", order: 1, createdAt: new Date(), updatedAt: null, deletedAt: null, isActive: false, createdByUserId: 0, createdDateTime: new Date() });
    targetAreas.push(<TargetArea>{ id: 2, name: "Biceps", order: 1, createdAt: new Date(), updatedAt: null, deletedAt: null, isActive: false, createdByUserId: 0, createdDateTime: new Date() });
    targetAreas.push(<TargetArea>{ id: 3, name: "Triceps", order: 1, createdAt: new Date(), updatedAt: null, deletedAt: null, isActive: false, createdByUserId: 0, createdDateTime: new Date() });
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

    super(_exerciseService);
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

  it('should get exercises', () => {

    //ARRANGE

    //ACT
    component.getExercises(10, "blah", ["Chest"]);

    //ASSERT
    expect(exerciseService.getAll).toHaveBeenCalledWith(10, component.pageSize(), "blah", ["Chest"]);

  });
});
