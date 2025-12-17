import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { of } from 'rxjs';
import { ExerciseDTO } from '../workouts/_models/exercise-dto';
import { TargetArea } from '../workouts/_models/target-area';
import { ExerciseListBase } from './exercise-list-base';
import { Component, inject as inject_1 } from '@angular/core';
import { PaginatedResults } from '../core/_models/paginated-results';
import { ExerciseService } from './_services/exercise.service';

class ExerciseServiceMock {
  getAll = vi.fn().mockReturnValue(of(new PaginatedResults<ExerciseDTO>()));
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
