import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedWorkoutDTO } from '../models/executed-workout-dto';
import { WorkoutService } from '../workout.service';

import { RecentWorkoutsComponent } from './recent-workouts.component';

class ExecutedWorkoutServiceMock {
  getRecent = jasmine.createSpy('getRecent ').and.returnValue(of(new Array<ExecutedWorkoutDTO>()));
}
class WorkoutServiceMock {}
class RouterMock {}

describe('RecentWorkoutsComponent', () => {
  let component: RecentWorkoutsComponent;
  let fixture: ComponentFixture<RecentWorkoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentWorkoutsComponent ], 
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
      ]
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
