import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkoutComponent } from './workout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/core/user.service';
import { of } from 'rxjs';
import { User } from 'app/core/models/user';
import { PaginatedResults } from '../../core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ResistanceBandService } from 'app/admin/resistance-bands/resistance-band.service';
import { ExecutedWorkout } from '../models/executed-workout';
import { ExecutedWorkoutService } from '../executed-workout.service';

class WorkoutServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new PaginatedResults<WorkoutDTO>()));
}

class UserServiceMock {
  getCurrentUserInfo = 
    jasmine.createSpy('getCurrentUserInfo')
      .and.returnValue(of(new User()));
}

class ResistanceBandServiceMock {
  getAllIndividualBands = 
    jasmine.createSpy('getAllIndividualBands')
      .and.returnValue(of(new Array<ResistanceBandIndividual>()));
}

class ExecutedWorkoutServiceMock {
  getNew = jasmine.createSpy('getNew').and.returnValue(of(new ExecutedWorkout()));
  add = jasmine.createSpy('add').and.returnValue(of(new ExecutedWorkout()));
}

describe('WorkoutComponent', () => {
  let component: WorkoutComponent;
  let fixture: ComponentFixture<WorkoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ], 
      declarations: [ WorkoutComponent ], 
      providers: [
        {
          provide: WorkoutService, 
          useClass: WorkoutServiceMock
        }, 
        {
          provide: UserService, 
          useClass: UserServiceMock
        }, 
        {
          provide: ResistanceBandService, 
          useClass: ResistanceBandServiceMock
        }, 
        {
          provide: ExecutedWorkoutService, 
          useClass: ExecutedWorkoutServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
