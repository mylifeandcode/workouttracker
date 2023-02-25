import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { ExecutedExerciseDTO } from '../models/executed-exercise-dto';
import { ExecutedWorkoutDTO } from '../models/executed-workout-dto';
import { Exercise } from '../models/exercise';
import { Workout } from '../models/workout';
import { groupBy } from 'lodash-es';
import { Dictionary } from 'lodash';

import { WorkoutViewComponent } from './workout-view.component';
import { Component, Input } from '@angular/core';
import { ProgressSpinnerComponentMock } from 'app/testing/component-mocks/primeNg/p-progress-spinner-mock';

const EXECUTED_WORKOUT_ID = 5;

class ExecutedWorkoutServiceMock {
  getById =
    jasmine.createSpy('getById')
      .and.returnValue(of(this.getFakeExecutedWorkout()));

  private getFakeExecutedWorkout(): ExecutedWorkoutDTO {

    const executedWorkout = new ExecutedWorkoutDTO();
    const executedExercise1 = new ExecutedExerciseDTO();
    const executedExercise2 = new ExecutedExerciseDTO();
    const executedExercise3 = new ExecutedExerciseDTO();

    executedExercise1.exerciseId = 1;
    executedExercise1.setType = 0;

    executedExercise2.exerciseId = 1;
    executedExercise2.setType = 0;

    executedExercise3.exerciseId = 2;
    executedExercise3.setType = 1;

    executedWorkout.exercises = [];
    executedWorkout.exercises.push(...[executedExercise1, executedExercise2, executedExercise3]);

    executedWorkout.name = "Some Workout";

    return executedWorkout;
  }

  public groupExecutedExercises(exercises: ExecutedExerciseDTO[]): Dictionary<ExecutedExerciseDTO[]> {
    const sortedExercises: ExecutedExerciseDTO[] = exercises.sort((a: ExecutedExerciseDTO, b: ExecutedExerciseDTO) => a.sequence - b.sequence);
    
    let groupedExercises = groupBy(exercises, (exercise: ExecutedExerciseDTO) => { 
      return exercise.exerciseId.toString() + '-' + exercise.setType.toString(); 
    });
    return groupedExercises;
  }

}

@Component({
  selector: 'wt-executed-exercises',
  template: ''
})
export class ExecutedExercisesComponentMock {

  @Input()
  executedExercises: ExecutedExerciseDTO[];

}

describe('WorkoutViewComponent', () => {
  let component: WorkoutViewComponent;
  let fixture: ComponentFixture<WorkoutViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        WorkoutViewComponent, 
        ExecutedExercisesComponentMock, 
        ProgressSpinnerComponentMock
      ],
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
    
    //TypeScript documentation says "size" is the way to determine the number of entries in the 
    //map, but I get "Expected undefined to be 2." from the line below:
    //expect(component.groupedExercises.size).toBe(2);
    //It looks like "length" would work when I view it in the debugger, but that blows up too.
    //This got even worse after the TypeScript compiler change to strict.

    //TODO: CLEAN THIS UP

    console.log("component.groupedExercises: ", component.groupedExercises);
    const entries: IterableIterator<[string, ExecutedExerciseDTO[]]> = component.groupedExercises.entries();

    console.log("ENTRIES: ", entries);

    const first = entries.next();
    console.log("FIRST: ", first);
    expect(first.value[1].length).toBe(2);

    const second = entries.next();
    console.log("SECOND: ", second);
    expect(second.value[1].length).toBe(1);

    entries.next();
    console.log("ENTRIES: ", entries);
  });
});
