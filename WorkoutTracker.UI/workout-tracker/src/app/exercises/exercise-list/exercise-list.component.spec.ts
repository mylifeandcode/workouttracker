import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExerciseListComponent } from './exercise-list.component';
import { TableModule } from 'primeng/table';
import { RouterTestingModule } from '@angular/router/testing';
import { ExerciseService } from '../exercise.service';
import { Exercise } from 'app/workouts/models/exercise';
import { of } from 'rxjs';
import { PaginatedResults } from '../../core/models/paginated-results';
import { MultiSelectModule } from 'primeng/multiselect';
import { TargetArea } from 'app/workouts/models/target-area';
import { TableComponentMock } from 'app/testing/component-mocks/primeNg/p-table-mock';

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
      declarations: [ 
        ExerciseListComponent, 
        TableComponentMock
      ],
      imports: [
        RouterTestingModule,
        MultiSelectModule
      ],
      providers: [
        {
          provide: ExerciseService,
          useClass: ExerciseServiceMock
        }
      ]
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

    const expectedParams: any[] =[0, 10, 'Pre', ['Chest']];

    //ACT
    component.getExercisesLazy(lazyLoadEvent);

    //ASSERT
    expect(exerciseService.getAll).toHaveBeenCalledWith(0, 10, 'Pre', ['Chest']);
  });
});
