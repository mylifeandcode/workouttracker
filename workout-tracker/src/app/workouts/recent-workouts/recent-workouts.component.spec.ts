import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DialogComponentMock } from 'app/testing/component-mocks/primeNg/p-dialog-mock';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../models/executed-workout-summary-dto';
import { Workout } from '../models/workout';
import { WorkoutService } from '../workout.service';

import { RecentWorkoutsComponent } from './recent-workouts.component';

class ExecutedWorkoutServiceMock {
  getRecent = jasmine.createSpy('getRecent ').and.returnValue(of(new Array<ExecutedWorkoutSummaryDTO>()));
}

class WorkoutServiceMock {}
class RouterMock {}

@Component({
  selector: 'wt-workout-info', 
  template: ''
})
class WorkoutInfoComponentMock {
  @Input()
  workout: Workout;
}

describe('RecentWorkoutsComponent', () => {
  let component: RecentWorkoutsComponent;
  let fixture: ComponentFixture<RecentWorkoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        RecentWorkoutsComponent, 
        DialogComponentMock, 
        WorkoutInfoComponentMock
      ], 
      providers: [
        {
          provide: ExecutedWorkoutService, 
          useClass: ExecutedWorkoutServiceMock
        }, 
        {
          provide: WorkoutService, 
          useClass: WorkoutServiceMock
        }, 
        {
          provide: Router, 
          useClass: RouterMock
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentWorkoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
