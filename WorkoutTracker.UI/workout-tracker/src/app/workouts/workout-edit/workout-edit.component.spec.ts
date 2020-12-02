import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { WorkoutEditComponent } from './workout-edit.component';
import { WorkoutService } from '../workout.service';
import { UserService } from 'app/core/user.service';
import { User } from 'app/core/models/user';
import { Workout } from 'app/workouts/models/workout';

@Component({
  selector: 'wt-exercise-list-mini', 
  template: ''
})
class FakeExerciseListMiniComponent{}

@Component({
  selector: 'wt-workout-set-definition', 
  template: ''
})
class FakeWorkoutSetDefComponent{}

class WorkoutServiceMock {
  getById = jasmine.createSpy('getById').and.returnValue(of(new Workout()));
}

class UserServiceMock {
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User()));
}

class BsModalServiceMock {

}

describe('WorkoutEditComponent', () => {
  let component: WorkoutEditComponent;
  let fixture: ComponentFixture<WorkoutEditComponent>;

  //Thanks to Mike Gallagher for the link: https://www.joshuacolvin.net/mocking-activated-route-data-in-angular/

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        WorkoutEditComponent, 
        FakeExerciseListMiniComponent, 
        FakeWorkoutSetDefComponent
      ], 
      imports: [
        ReactiveFormsModule, 
        ProgressSpinnerModule, 
        RouterTestingModule
      ], 
      providers: [
        {
          provide: ActivatedRoute, 
          useValue: {
            params: of({
              id: 5
            })
          }
        }, 
        {
          provide: WorkoutService, 
          useClass: WorkoutServiceMock
        }, 
        {
          provide: UserService, 
          useClass: UserServiceMock
        }, 
        {
          provide: BsModalService, 
          useClass: BsModalServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
