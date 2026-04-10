import { CUSTOM_ELEMENTS_SCHEMA, Component, input, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedExerciseDTO, ExecutedWorkoutDTO } from '../../api';
import { WorkoutViewComponent } from './workout-view.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ExecutedExercisesComponent } from './executed-exercises/executed-exercises.component';
import { DatePipe } from '@angular/common';
import { type Mocked } from 'vitest';

const EXECUTED_WORKOUT_PUBLIC_ID = 'some-guid-5';

function getFakeExecutedWorkoutForView(): ExecutedWorkoutDTO {
  const executedWorkout = <ExecutedWorkoutDTO>{};
  const executedExercise1 = <ExecutedExerciseDTO>{};
  const executedExercise2 = <ExecutedExerciseDTO>{};
  const executedExercise3 = <ExecutedExerciseDTO>{};

  executedExercise1.exerciseId = "1";
  executedExercise1.setType = 0;

  executedExercise2.exerciseId = "1";
  executedExercise2.setType = 0;

  executedExercise3.exerciseId = "2";
  executedExercise3.setType = 1;

  executedWorkout.exercises = [];
  executedWorkout.exercises.push(...[executedExercise1, executedExercise2, executedExercise3]);

  executedWorkout.name = "Some Workout";

  return executedWorkout;
}

@Component({
  selector: 'wt-executed-exercises',
  template: '',
  standalone: true
})
export class MockExecutedExercisesComponent {

  readonly executedExercises = input<ExecutedExerciseDTO[]>([]);

  readonly showResults = input<boolean>(false);
}

describe('WorkoutViewComponent', () => {
  let component: WorkoutViewComponent;
  let fixture: ComponentFixture<WorkoutViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WorkoutViewComponent,
        MockExecutedExercisesComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ExecutedWorkoutService,
          useValue: <Partial<Mocked<ExecutedWorkoutService>>>{
            getById: vi.fn().mockReturnValue(of(getFakeExecutedWorkoutForView())),
            groupExecutedExercises: vi.fn().mockImplementation((exercises: ExecutedExerciseDTO[]) => {
              const sortedExercises: ExecutedExerciseDTO[] = exercises.sort((a: ExecutedExerciseDTO, b: ExecutedExerciseDTO) => a.sequence - b.sequence);

              const groupedExercises = sortedExercises.reduce((groups, exercise) => {
                const key = exercise.exerciseId.toString() + '-' + exercise.setType.toString();

                if (!groups[key]) {
                  groups[key] = [];
                }
                groups[key].push(exercise);

                return groups;
              }, {} as Record<string, ExecutedExerciseDTO[]>);

              return groupedExercises;
            })
          }
        }
      ]
    })
      .overrideComponent(WorkoutViewComponent, {
        remove: { imports: [NzSpinModule, ExecutedExercisesComponent, DatePipe] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', EXECUTED_WORKOUT_PUBLIC_ID);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get executed workout based on id', () => {
    const executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    expect(executedWorkoutService.getById).toHaveBeenCalledTimes(1);
    expect(executedWorkoutService.getById).toHaveBeenCalledWith(EXECUTED_WORKOUT_PUBLIC_ID);
    expect(component.executedWorkout).toBeTruthy();
    expect(component.groupedExercises).toBeTruthy();

    //TypeScript documentation says "size" is the way to determine the number of entries in the 
    //map, but I get "Expected undefined to be 2." from the line below:
    //expect(component.groupedExercises.size).toBe(2);
    //It looks like "length" would work when I view it in the debugger, but that blows up too.
    //This got even worse after the TypeScript compiler change to strict.

    //TODO: CLEAN THIS UP

    //console.log("component.groupedExercises: ", component.groupedExercises);
    if (component.groupedExercises === undefined)
      throw new Error("component.groupedExercises is undefined.");
    else {
      const entries: IterableIterator<[
        string,
        ExecutedExerciseDTO[]
      ]> = component.groupedExercises.entries();

      const first = entries.next();
      expect(first.value[1].length).toBe(2);

      const second = entries.next();
      expect(second.value[1].length).toBe(1);

      entries.next();
    }
  });
});
