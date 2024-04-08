import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultiSelectModule } from 'primeng/multiselect';
import { of } from 'rxjs';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { TargetArea } from 'app/workouts/models/target-area';
import { ExerciseListBase } from './exercise-list-base';
import { Component } from '@angular/core';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { ExerciseService } from './exercise.service';

class ExerciseServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new PaginatedResults<ExerciseDTO>()));
  getTargetAreas = jasmine.createSpy('getTargetAreas')
    .and.callFake(() => {
      const targetAreas = new Array<TargetArea>();
      targetAreas.push(new TargetArea(1, "Chest", 1, new Date(), null, null, false));
      targetAreas.push(new TargetArea(2, "Biceps", 1, new Date(), null, null, false));
      targetAreas.push(new TargetArea(3, "Triceps", 1, new Date(), null, null, false));
      return of(targetAreas);
    });
}

//We're testing an abstract base class, so let's create a class here that extends it
@Component({})
class ExerciseListBaseExtenderComponent extends ExerciseListBase {
  constructor(private _exerciseService: ExerciseService) {
    super(_exerciseService);
  }
}

describe('ExerciseListMiniComponent', () => {
  let component: ExerciseListBaseExtenderComponent;
  let fixture: ComponentFixture<ExerciseListBaseExtenderComponent>;
  let exerciseService: ExerciseService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        ExerciseListBaseExtenderComponent
      ],
      providers: [
        {
          provide: ExerciseService,
          useClass: ExerciseServiceMock
        }
      ],
      imports: [
        MultiSelectModule
      ]
    })
    .compileComponents();
  }));

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
    expect(component.targetAreas.length).toBe(3);
  });

  it('should get exercises', () => {

    //ARRANGE

    //ACT
    component.getExercises(10, "blah", ["Chest"]);

    //ASSERT
    expect(exerciseService.getAll).toHaveBeenCalledWith(10, component.pageSize, "blah", ["Chest"]);

  });
});
