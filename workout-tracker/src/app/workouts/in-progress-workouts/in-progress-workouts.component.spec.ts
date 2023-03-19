import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutDTO } from '../models/executed-workout-dto';

import { InProgressWorkoutsComponent } from './in-progress-workouts.component';

class MockExeceutedWorkoutService {
  getInProgress = jasmine.createSpy('getInProgress').and.callFake(() => {
    const workouts: ExecutedWorkoutDTO[] = [];
    workouts.push(...
      [<ExecutedWorkoutDTO>
      { 
        id: 56, 
        name: 'Chest and Arms', 
        workoutId: 56, 
        startDateTime: new Date(2023, 2, 18, 12, 13, 14), endDateTime: null, 
        journal: null, rating: 0, exercises: [], 
        createdByUserId: 1, createdDateTime: new Date(2023, 3, 18, 12, 0, 0), 
        modifiedByUserId: 1, modifiedDateTime: new Date(2023, 3, 18, 12, 5, 0)
      },
      <ExecutedWorkoutDTO>
      { 
        id: 56, 
        name: 'Chest and Arms', 
        workoutId: 56, 
        startDateTime: new Date(2023, 2, 18, 12, 13, 14), endDateTime: null, 
        journal: null, rating: 0, exercises: [], 
        createdByUserId: 1, createdDateTime: new Date(2023, 3, 18, 12, 0, 0), 
        modifiedByUserId: 1, modifiedDateTime: new Date(2023, 3, 18, 12, 5, 0)
      }]);

      return of(workouts);
  });
}

describe('InProgressWorkoutsComponent', () => {
  let component: InProgressWorkoutsComponent;
  let fixture: ComponentFixture<InProgressWorkoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InProgressWorkoutsComponent ],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useClass: MockExeceutedWorkoutService
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InProgressWorkoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get in-progress workouts on init', () => {
    //ARRANGE
    const service = TestBed.inject(ExecutedWorkoutService);

    //ACT

    //ASSERT
    expect(service.getInProgress).toHaveBeenCalledTimes(1);
    expect(component.inProgressWorkouts.length).toBe(2);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBeNull();
  });
});
