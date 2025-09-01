import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ExerciseListMiniComponent } from './exercise-list-mini.component';
import { ExerciseService } from '../_services/exercise.service';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { of } from 'rxjs';
import { ExerciseDTO } from 'app/workouts/_models/exercise-dto';
import { TargetArea } from 'app/workouts/_models/target-area';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';

class ExerciseServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new PaginatedResults<ExerciseDTO>()));
  getTargetAreas = jasmine.createSpy('getTargetAreas').and.returnValue(of(new Array<TargetArea>()));
}

describe('ExerciseListMiniComponent', () => {
  let component: ExerciseListMiniComponent;
  let fixture: ComponentFixture<ExerciseListMiniComponent>;
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
        ExerciseListMiniComponent
      ]
    })
      .overrideComponent(ExerciseListMiniComponent,
        {
          remove: {
            imports: [NzTableModule] //Some imports still required to test
          },
          add: {
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
          }
        })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListMiniComponent);
    component = fixture.componentInstance;
    exerciseService = TestBed.inject(ExerciseService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //TODO: Revisit
  xit('should get exercises lazily', () => {
    //TODO: Consolidate the method we're testing: it exists in 2 different classes.

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

  it('should emit event when exercise is selected', () => {
    //ARRANGE
    const exerciseDTO = new ExerciseDTO();
    spyOn(component.exerciseSelected, 'emit');

    //ACT
    component.selectExercise(exerciseDTO);

    //ASSERT
    expect(component.exerciseSelected.emit).toHaveBeenCalledWith(exerciseDTO);
  });

});
