import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutComponent } from './workout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/users/user.service';
import { of } from 'rxjs';
import { User } from 'app/models/user';
import { PaginatedResults } from 'app/models/paginated-results';
import { WorkoutDTO } from 'app/models/workout-dto';

class WorkoutServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new PaginatedResults<WorkoutDTO>()));
}

class UserServiceMock {
  getCurrentUserInfo = 
    jasmine.createSpy('getCurrentUserInfo')
      .and.returnValue(of(new User()));
}

describe('WorkoutComponent', () => {
  let component: WorkoutComponent;
  let fixture: ComponentFixture<WorkoutComponent>;

  beforeEach(async(() => {
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
