import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../_services/workout.service';
import { of } from 'rxjs';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { WorkoutDTO } from 'app/workouts/_models/workout-dto';
import { HttpResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';


class WorkoutServiceMock {
  getFilteredSubset = jasmine.createSpy('getFilteredSubset').and.returnValue(of(new PaginatedResults<WorkoutDTO>()));
  retire = jasmine.createSpy('retire').and.returnValue(of(new HttpResponse<any>()));
  reactivate = jasmine.createSpy('reactivate').and.returnValue(of(new HttpResponse<any>()));
}

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;
  let workoutService: WorkoutService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        WorkoutListComponent
      ],
      providers: [
  provideZonelessChangeDetection(),
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutListComponent);
    component = fixture.componentInstance;
    workoutService = TestBed.inject(WorkoutService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
  it('should get workouts filtered by name lazily (active only)', () => {
    //TODO: Consolidate the method we're testing: it exists in 2 different classes.

    //ARRANGE 
    const lazyLoadEvent: any = { //Unfortunately, the parameter of the onLazyLoad event of PrimeNg's table is declared as type "any"
      "first": 0,
      "rows": 10,
      "sortOrder": 1,
      "filters": {
        "name": {
          "value": "Chest",
          "matchMode": "in"
        }
      },
      "globalFilter": null
    };

    //ACT
    component.getWorkoutsLazy(lazyLoadEvent);

    //ASSERT
    expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 10, true, 'Chest');
  });

  it('should get workouts filtered by name lazily (active and inactive)', () => {
    //TODO: Consolidate the method we're testing: it exists in 2 different classes.

    //ARRANGE 
    const lazyLoadEvent: any = { //Unfortunately, the parameter of the onLazyLoad event of PrimeNg's table is declared as type "any"
      "first": 0,
      "rows": 10,
      "sortOrder": 1,
      "filters": {
        "activeOnly": {
          "value": false,
          "matchMode": "equals"
        },
        "name": {
          "value": "Arms",
          "matchMode": "in"
        }
      },
      "globalFilter": null
    };

    //ACT
    component.getWorkoutsLazy(lazyLoadEvent);

    //ASSERT
    expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 10, false, 'Arms');
  });

  /*
  it('should get workouts without name filter lazily', () => {
    //TODO: Consolidate the method we're testing: it exists in 2 different classes.

    //ARRANGE 
    const lazyLoadEvent: any = { //Unfortunately, the parameter of the onLazyLoad event of PrimeNg's table is declared as type "any"
      "first": 0,
      "rows": 10,
      "sortOrder": 1,
      "filters": {
        "activeOnly": {
          "value": true,
          "matchMode": "equals"
        }
      },
      "globalFilter": null
    };

    //ACT
    component.getWorkoutsLazy(lazyLoadEvent);

    //ASSERT
    expect(workoutService.getFilteredSubset).toHaveBeenCalledWith(0, 10, true, null);
  });
  */

  //TODO: Revisit
  xit('should retire a workout', () => {
    //ARRANGE
    spyOn(window, 'confirm').and.returnValue(true);

    //ACT
    component.retireWorkout('some-guid', "My Workout");

    //ASSERT
    expect(workoutService.retire).toHaveBeenCalledWith('some-guid');
    expect(workoutService.getFilteredSubset).toHaveBeenCalledTimes(1);
  });

  //TODO: Revisit
  xit('should reactivate a workout', () => {
    //ARRANGE
    spyOn(window, 'confirm').and.returnValue(true);

    //ACT
    component.reactivateWorkout("some-guid", "My Workout");

    //ASSERT
    expect(workoutService.reactivate).toHaveBeenCalledWith("some-guid");
    expect(workoutService.getFilteredSubset).toHaveBeenCalledTimes(1);
  });

});
