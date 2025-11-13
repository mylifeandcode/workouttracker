import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutListComponent);
    component = fixture.componentInstance;
    workoutService = TestBed.inject(WorkoutService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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
