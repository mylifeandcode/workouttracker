import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';

import { WorkoutEditComponent } from './workout-edit.component';
import { WorkoutService } from '../workout.service';
import { Workout } from 'app/workouts/models/workout';
import { ProgressSpinnerComponentMock } from 'app/testing/component-mocks/primeNg/p-progress-spinner-mock';

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
        FakeWorkoutSetDefComponent, 
        ProgressSpinnerComponentMock
      ],
      imports: [
        ReactiveFormsModule,
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
