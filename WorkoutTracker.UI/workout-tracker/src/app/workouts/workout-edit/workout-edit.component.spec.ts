import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';

import { WorkoutEditComponent } from './workout-edit.component';
import { WorkoutService } from '../workout.service';
import { Workout } from 'app/workouts/models/workout';
import { ProgressSpinnerComponentMock } from 'app/testing/component-mocks/primeNg/p-progress-spinner-mock';
import { ExerciseInWorkout } from '../models/exercise-in-workout';

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
  private getTestWorkout(): Workout {
    const workout = new Workout();
    workout.id = WORKOUT_ID;
    workout.active = true;
    workout.name = 'Test Workout';
    workout.exercises = [];
    workout.exercises.push(<ExerciseInWorkout>{ 
      id: 1, exerciseId: 10, exercise: { name: 'Bench Press' }, setType: 1, numberOfSets: 3
    });
    workout.exercises.push(<ExerciseInWorkout>{ 
      id: 2, exerciseId: 20, exercise: { name: 'Biceps Curls' }, setType: 2, numberOfSets: 4
    });    
    return workout;
  }
  getById = jasmine.createSpy('getById').and.returnValue(of(this.getTestWorkout()));
}

class BsModalServiceMock {

}

const WORKOUT_ID: number = 5;

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
              id: WORKOUT_ID
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

  it('should get workout ID from route params during init', () => {
    expect(component.workoutId).toBe(WORKOUT_ID);
  });

  it('should get create form during init', () => {
    expect(component.workoutForm).not.toBeNull();
    expect(component.workoutForm.controls.id).not.toBeNull();
    expect(component.workoutForm.controls.id.hasValidator(Validators.required)).toBeTrue();
    expect(component.workoutForm.controls.active).not.toBeNull();
    expect(component.workoutForm.controls.active.hasValidator(Validators.required)).toBeTrue();
    expect(component.workoutForm.controls.name).not.toBeNull();
    expect(component.workoutForm.controls.name.hasValidator(Validators.required)).toBeTrue();
    expect(component.workoutForm.controls.exercises).not.toBeNull();
  });

  it('should load workout based on route param ID during init', () => {
    const workoutService = TestBed.inject(WorkoutService);
    expect(workoutService.getById).toHaveBeenCalledOnceWith(WORKOUT_ID);
    expect(component.workoutForm.controls.id.value).toBe(WORKOUT_ID);
    expect(component.workoutForm.controls.active.value).toBeTrue();
    expect(component.workoutForm.controls.name.value).toBe('Test Workout');
    expect(component.workoutForm.controls.exercises.value[0].id).toBe(1);
    expect(component.workoutForm.controls.exercises.value[0].exerciseId).toBe(10);
    expect(component.workoutForm.controls.exercises.value[0].exerciseName).toBe('Bench Press');
    expect(component.workoutForm.controls.exercises.value[0].numberOfSets).toBe(3);
    expect(component.workoutForm.controls.exercises.value[0].setType).toBe(1);
    expect(component.workoutForm.controls.exercises.value[1].id).toBe(2);
    expect(component.workoutForm.controls.exercises.value[1].exerciseId).toBe(20);
    expect(component.workoutForm.controls.exercises.value[1].exerciseName).toBe('Biceps Curls');
    expect(component.workoutForm.controls.exercises.value[1].numberOfSets).toBe(4);
    expect(component.workoutForm.controls.exercises.value[1].setType).toBe(2);
  });
});
