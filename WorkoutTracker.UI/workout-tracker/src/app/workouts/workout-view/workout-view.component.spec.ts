import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExerciseService } from '../../exercises/exercise.service';
import { ExecutedExercise } from '../models/executed-exercise';
import { ExecutedWorkout } from '../models/executed-workout';
import { Exercise } from '../models/exercise';
import { Workout } from '../models/workout';

import { WorkoutViewComponent } from './workout-view.component';

const EXECUTED_WORKOUT_ID = 5;

class ExecutedWorkoutServiceMock {
  getById =
    jasmine.createSpy('getById')
      .and.returnValue(of(this.getFakeExecutedWorkout()));

  getFakeExecutedWorkout(): ExecutedWorkout {

    const executedWorkout = new ExecutedWorkout();
    const executedExercise1 = new ExecutedExercise();
    const executedExercise2 = new ExecutedExercise();
    const executedExercise3 = new ExecutedExercise();
    const exercise1 = new Exercise();
    const exercise2 = new Exercise();

    exercise1.id = 1;
    exercise2.id = 2;

    executedExercise1.exercise = exercise1;
    executedExercise1.setType = 0;

    executedExercise2.exercise = exercise1;
    executedExercise2.setType = 0;

    executedExercise3.exercise = exercise2;
    executedExercise3.setType = 1;

    executedWorkout.exercises = [];
    executedWorkout.exercises.push(...[executedExercise1, executedExercise2, executedExercise3]);

    const workout = new Workout();
    workout.name = "Some Workout";

    executedWorkout.workout = workout;

    return executedWorkout;

  }
}

describe('WorkoutViewComponent', () => {
  let component: WorkoutViewComponent;
  let fixture: ComponentFixture<WorkoutViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutViewComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              id: EXECUTED_WORKOUT_ID
            })
          }
        },
        {
          provide: ExecutedWorkoutService,
          useClass: ExecutedWorkoutServiceMock
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get executed workout based on route', () => {
    const executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    expect(executedWorkoutService.getById).toHaveBeenCalledOnceWith(EXECUTED_WORKOUT_ID);
    expect(component.executedWorkout).toBeTruthy();
    expect(component.groupedExercises).toBeTruthy();
    //TODO: Verify key count
    expect(component.groupedExercises["1-0"].length).toBe(2);
    expect(component.groupedExercises["2-1"].length).toBe(1);
  });
});
