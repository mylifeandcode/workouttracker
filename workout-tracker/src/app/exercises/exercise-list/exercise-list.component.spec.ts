import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExerciseListComponent } from './exercise-list.component';
import { ExerciseService } from '../_services/exercise.service';
import { Exercise } from 'app/workouts/_models/exercise';
import { of } from 'rxjs';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { TargetArea } from 'app/workouts/_models/target-area';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

class ExerciseServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new PaginatedResults<Exercise>()));
  getTargetAreas = jasmine.createSpy('getTargetAreas').and.returnValue(of(new Array<TargetArea>()));
}

describe('ExerciseListComponent', () => {
  let component: ExerciseListComponent;
  let fixture: ComponentFixture<ExerciseListComponent>;
  let exerciseService: ExerciseService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        ExerciseListComponent
      ],
      providers: [
        {
          provide: ExerciseService,
          useClass: ExerciseServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    exerciseService = TestBed.inject(ExerciseService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get exercises lazily', () => {
    //ARRANGE
    const lazyLoadEvent: any = { //Unfortunately, the parameter of the onLazyLoad event of PrimeNg's table is declared as type "any"
      "first": 0,
      "rows": 10,
      "sortOrder": 1,
      "filters": {
        "targetAreas": {
          "value": [
            "Chest"
          ],
          "matchMode": "in"
        },
        "name": {
          "value": "Pre",
          "matchMode": "in"
        }
      },
      "globalFilter": null
    };

    const expectedParams: any[] = [0, 10, 'Pre', ['Chest']];

    //ACT
    component.getExercisesLazy(lazyLoadEvent);

    //ASSERT
    expect(exerciseService.getAll).toHaveBeenCalledWith(0, 10, 'Pre', ['Chest']);
  });
});
