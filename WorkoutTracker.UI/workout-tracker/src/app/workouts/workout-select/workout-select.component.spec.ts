import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'app/core/auth.service';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { of } from 'rxjs';
import { WorkoutDTO } from '../models/workout-dto';
import { WorkoutService } from '../workout.service';

import { WorkoutSelectComponent } from './workout-select.component';

class WorkoutServiceMock {
  getAll = jasmine.createSpy('getAll').and.callFake(() => {
      let fakeResponse = new PaginatedResults<WorkoutDTO>();
      fakeResponse.results = [];
      fakeResponse.results.push(new WorkoutDTO());
      fakeResponse.results[0].workoutName = "Workout 1";
      fakeResponse.results.push(new WorkoutDTO());
      fakeResponse.results[1].workoutName = "Workout 2";
      fakeResponse.totalCount = 2;
      return of(fakeResponse);
    });
}

@Component({
  selector: 'wt-recent-workouts', 
  template: ''
})
class RecentWorkoutsComponentMock {}

describe('WorkoutSelectComponent', () => {
  let component: WorkoutSelectComponent;
  let fixture: ComponentFixture<WorkoutSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutSelectComponent, RecentWorkoutsComponentMock ], 
      providers: [
        {
          provide: WorkoutService, 
          useClass: WorkoutServiceMock
        }, 
        {
          provide: AuthService, 
          useValue: jasmine.createSpyObj("AuthService", {}, { currentUserName: of("someUser") })
        }
      ], 
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
