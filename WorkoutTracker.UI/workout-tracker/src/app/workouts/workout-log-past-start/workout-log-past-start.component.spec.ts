import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { of } from 'rxjs';
import { WorkoutDTO } from '../models/workout-dto';
import { WorkoutService } from '../workout.service';

import { WorkoutLogPastStartComponent } from './workout-log-past-start.component';

class WorkoutServiceMock {
  getFilteredSubset = jasmine.createSpy('getFilteredSubset').and.returnValue(of(this.getWorkouts()));

  private getWorkouts(): PaginatedResults<WorkoutDTO> {
    const result = new PaginatedResults<WorkoutDTO>();
    
    result.totalCount = 3;
    result.results = [];

    for(let x = 0; x < 3; x++) {
      result.results.push(new WorkoutDTO());
      result.results[x].id = x;
      result.results[x].workoutName = `Workout ${x}`;  
    }

    return result;
  }

}

class RouterMock {
  navigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
}

describe('WorkoutLogPastStartComponent', () => {
  let component: WorkoutLogPastStartComponent;
  let fixture: ComponentFixture<WorkoutLogPastStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutLogPastStartComponent ],
      providers: [
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
        },
        {
          provide: Router,
          useClass: RouterMock
        },
        FormBuilder //TODO: Find out what the proper ettiquite is for components which use a FormBuilder -- should we mock it like other dependencies?
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutLogPastStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get workouts on init', () => {
    const service = TestBed.inject(WorkoutService);
    expect(service.getFilteredSubset).toHaveBeenCalledWith(0, 500, true);
    expect(component.workouts).not.toBeNull();
    expect(component.workouts.length).toBe(3);
  });

  it('should proceed to the next step via proceedToWorkoutEntry()', () => {

    //ARRANGE
    const router = TestBed.inject(Router);
    component.formGroup.patchValue( 
      { 
        workoutId: 1, 
        startDateTime: new Date(2022, 3, 4, 12, 0, 0), 
        endDateTime: new Date(2022, 3, 4, 12, 30, 15) 
      } 
    );

    //ACT
    component.proceedToWorkoutEntry();

    //ASSERT
    expect(router.navigate)
      .toHaveBeenCalledWith(['/workouts/plan-for-past/1/2022-04-04T16:00:00.000Z/2022-04-04T16:30:15.000Z']);

  });

});
