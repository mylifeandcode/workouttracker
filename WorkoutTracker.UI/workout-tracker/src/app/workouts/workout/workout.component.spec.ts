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
import { Workout } from '../models/workout';
import { ExecutedExercise } from '../models/executed-exercise';
import { Exercise } from '../models/exercise';

const MOCK_USER_ID: number = 15;

function getFakeUserWorkouts(): PaginatedResults<WorkoutDTO> {
  let workouts = new PaginatedResults<WorkoutDTO>();
  workouts.totalCount = 3;
  for(let x = 0; x < workouts.totalCount; x++) {
    workouts.results = new Array<WorkoutDTO>();
    workouts.results.push(new WorkoutDTO())
  }
  return workouts;
}

function getResistanceBands(): ResistanceBandIndividual[] {
  let bands: ResistanceBandIndividual[] = [];
  bands.push(new ResistanceBandIndividual('Orange', 30));
  bands.push(new ResistanceBandIndividual('Purple', 23));
  bands.push(new ResistanceBandIndividual('Black', 19));
  return bands;
}

function getFakeExecutedWorkout(): ExecutedWorkout {
  let executedWorkout = new ExecutedWorkout();
  executedWorkout.exercises = [];
  for(let x = 0; x < 3; x++) {
    let exercise = new ExecutedExercise();
    exercise.exercise = new Exercise(); //So...yeah. Mistakes were made with the naming. :/
    exercise.exercise.id = x;
    exercise.exercise.name = "Exercise " + x.toString();
    exercise.exercise.resistanceType = x;
    exercise.setType = ((x + 1) % 2);
    executedWorkout.exercises.push(exercise);
  }
  
  return executedWorkout;
}

class WorkoutServiceMock {
  getAll = jasmine.createSpy('getAll')
    .and.returnValue(of(getFakeUserWorkouts()));
}

class UserServiceMock {
  getCurrentUserInfo = 
    jasmine.createSpy('getCurrentUserInfo')
      .and.returnValue(of(new User({id: MOCK_USER_ID})));
}

class ResistanceBandServiceMock {
  getAllIndividualBands = 
    jasmine.createSpy('getAllIndividualBands')
      .and.returnValue(of(getResistanceBands()));
}

class ExecutedWorkoutServiceMock {
  getNew = jasmine.createSpy('getNew').and.returnValue(of(getFakeExecutedWorkout()));
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

  it('should create FormGroup on init', () => {
    expect(component.workoutForm).toBeDefined();
    expect(component.workoutForm.controls.id.value).toBe(0);
    expect(component.workoutForm.controls.exercises).toBeDefined();
    expect(component.workoutForm.controls.journal.value).toBe('');
  });

  it('should get current user info on init', () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const expectedResults = getFakeUserWorkouts().results;

    //ASSERT
    expect(userService.getCurrentUserInfo).toHaveBeenCalledTimes(1);
    expect(component.workouts).toEqual(expectedResults);
  });

  it('should get resistance bancs on init', () => {
    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const expectedResults = getResistanceBands();

    //ASSERT
    expect(resistanceBandService.getAllIndividualBands).toHaveBeenCalledTimes(1);
    expect(component.allResistanceBands).toEqual(expectedResults);
  });

  it('should set up workout when selected', () => {
    //ARRANGE
    const executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    const expectedExecutedWorkout = getFakeExecutedWorkout();

    //ACT
    component.workoutSelected(12);

    //ASSERT
    expect(executedWorkoutService.getNew).toHaveBeenCalledTimes(1);
    expect(component.workout).toEqual(expectedExecutedWorkout);
    //TODO: Finish. Verify form group controls.
  });
});
