import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutComponent } from './workout.component';
import { WorkoutService } from '../_services/workout.service';
import { of } from 'rxjs';
import { ResistanceBandIndividual } from '../../shared/models/resistance-band-individual';
import { ResistanceBandService } from '../../shared/services/resistance-band.service';
import { ExecutedExerciseDTO, ExecutedWorkoutDTO, ResistanceType, SetType, WorkoutDTO, PaginatedResultsOfWorkoutDTO } from '../../api';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, provideZonelessChangeDetection, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ResistanceBandSelection } from '../_models/resistance-band-selection';
import { ResistanceBandSelectComponent } from '../_shared/resistance-band-select/resistance-band-select.component';
import { WorkoutExerciseComponent } from './workout-exercise/workout-exercise.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { DurationComponent } from '../_shared/duration/duration.component';
import { IWorkoutFormExerciseSet } from './_interfaces/i-workout-form-exercise-set';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { type Mocked } from 'vitest';

const NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT = 4;

//HELPER FUNCTIONS ////////////////////////////////////////////////////////////
const getFakeUserWorkouts = (): PaginatedResultsOfWorkoutDTO => {
  const workouts = <PaginatedResultsOfWorkoutDTO>{};
  workouts.totalCount = 3;
  for (let x = 0; x < workouts.totalCount; x++) {
    workouts.results = new Array<WorkoutDTO>();
    workouts.results.push(<WorkoutDTO>{});
  }
  return workouts;
};

function getResistanceBands(): ResistanceBandIndividual[] {
  const bands: ResistanceBandIndividual[] = [];
  bands.push(new ResistanceBandIndividual('Orange', 30));
  bands.push(new ResistanceBandIndividual('Purple', 23));
  bands.push(new ResistanceBandIndividual('Black', 19));
  return bands;
}

function getFakeExecutedWorkout(): ExecutedWorkoutDTO {
  const executedWorkout = <ExecutedWorkoutDTO>{};

  executedWorkout.name = "Fake Workout";
  executedWorkout.exercises = [];
  for (let x = 0; x < NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT; x++) {
    const exercise = <ExecutedExerciseDTO>{};

    exercise.bandsEndToEnd = (x % 2 > 0);
    exercise.exerciseId = (x + 1).toString();
    exercise.name = "Exercise " + x.toString();
    exercise.resistanceType = <ResistanceType>x;
    exercise.resistanceAmount = x * 10;
    exercise.resistanceMakeup = exercise.resistanceAmount.toString();
    exercise.targetRepCount = x * 5;
    exercise.setType = <SetType>((x + 1) % 2);
    exercise.sequence = x;
    executedWorkout.exercises.push(exercise);
  }

  /*
  Duplicate the last exercise so we can verify the grouping works.
  For example, a workout can have 1 set of push ups and 2 sets of bicep curls.
  In this case, there are 2 DISTINCT exercises in the workout (and 3 executed exercises).
  */
  const lastExercise = executedWorkout.exercises[executedWorkout.exercises.length - 1];
  const oneMoreExercise = <ExecutedExerciseDTO>{};

  oneMoreExercise.bandsEndToEnd = lastExercise.bandsEndToEnd;
  oneMoreExercise.exerciseId = lastExercise.exerciseId;
  oneMoreExercise.name = lastExercise.name;
  oneMoreExercise.resistanceType = lastExercise.resistanceType;
  oneMoreExercise.resistanceAmount = lastExercise.resistanceAmount;
  oneMoreExercise.resistanceMakeup = lastExercise.resistanceMakeup;
  oneMoreExercise.targetRepCount = lastExercise.targetRepCount;
  oneMoreExercise.setType = lastExercise.setType;
  oneMoreExercise.sequence = lastExercise.sequence + 1;
  executedWorkout.exercises.push(oneMoreExercise);
  return executedWorkout;
}

//Returns the field tree for the first set of the first exercise
function getFirstSetField(component: WorkoutComponent): FieldTree<IWorkoutFormExerciseSet> {
  return component.workoutForm.exercises[0].exerciseSets[0];
}
//END HELPER FUNCTIONS ////////////////////////////////////////////////////////

//COMPONENT MOCK CLASSES //////////////////////////////////////////////////////
/*
The casting solution presented at this URL did not work: https://medium.com/angular-in-depth/angular-unit-testing-viewchild-4525e0c7b756
Unfortunately, for now, I've had to mock each property and method. :/
*/
@Component({
  selector: 'wt-resistance-band-select',
  template: ''
})
class MockResistanceBandSelectComponent extends ResistanceBandSelectComponent {

  public override readonly resistanceBandInventory = input<ResistanceBandIndividual[]>([]);

  public override okClicked = output<ResistanceBandSelection>();

  public override cancelClicked = output<void>();

  override setBandAllocation = vi.fn();
}

//END COMPONENT MOCK CLASSES //////////////////////////////////////////////////
describe('WorkoutComponent', () => {
  let component: WorkoutComponent;
  let fixture: ComponentFixture<WorkoutComponent>;

  beforeEach(async () => {
    const WorkoutServiceMock: Partial<Mocked<WorkoutService>> = {
      getFilteredSubset: vi.fn<WorkoutService['getFilteredSubset']>().mockReturnValue(of(getFakeUserWorkouts()))
    };

    const ResistanceBandServiceMock: Partial<Mocked<ResistanceBandService>> = {
      getAllIndividualBands: vi.fn<ResistanceBandService['getAllIndividualBands']>().mockReturnValue(of(getResistanceBands()))
    };

    const ExecutedWorkoutServiceMock: Partial<Mocked<ExecutedWorkoutService>> = {
      add: vi.fn<ExecutedWorkoutService['add']>().mockImplementation((workout: ExecutedWorkoutDTO) => of(workout)),
      getById: vi.fn<ExecutedWorkoutService['getById']>().mockReturnValue(of(getFakeExecutedWorkout())),
      groupExecutedExercises: vi.fn<ExecutedWorkoutService['groupExecutedExercises']>().mockImplementation((exercises: ExecutedExerciseDTO[]) => {
        const sortedExercises: ExecutedExerciseDTO[] = exercises
          .sort((a: ExecutedExerciseDTO, b: ExecutedExerciseDTO) => a.sequence - b.sequence);

        const groupedExercises = sortedExercises.reduce((groups, exercise) => {
          const key = exercise.exerciseId.toString() + '-' + exercise.setType.toString();
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(exercise);
          return groups;
        }, {} as Record<string, ExecutedExerciseDTO[]>);

        return groupedExercises;
      }),
      update: vi.fn<ExecutedWorkoutService['update']>().mockImplementation((workout: ExecutedWorkoutDTO) => of(workout))
    };

    const NzMessageServiceMock: Partial<Mocked<NzMessageService>> = {
      success: vi.fn<NzMessageService['success']>(),
      info: vi.fn<NzMessageService['info']>(),
      error: vi.fn<NzMessageService['error']>(),
      remove: vi.fn<NzMessageService['remove']>()
    };

    await TestBed.configureTestingModule({
      imports: [
        WorkoutComponent,
        MockResistanceBandSelectComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: WorkoutService,
          useValue: WorkoutServiceMock
        },
        {
          provide: ResistanceBandService,
          useValue: ResistanceBandServiceMock
        },
        {
          provide: ExecutedWorkoutService,
          useValue: ExecutedWorkoutServiceMock
        },
        {
          provide: NzMessageService,
          useValue: NzMessageServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(WorkoutComponent, {
        remove: {
          imports: [
            WorkoutExerciseComponent,
            ResistanceBandSelectComponent,
            CountdownTimerComponent,
            DurationComponent,
            NzCollapseModule,
            NzSpinModule
          ]
        },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('executedWorkoutPublicId', 'someGuid');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the form model on init', () => {
    expect(component.workoutForm).toBeDefined();
    expect(component.workoutForm.publicId().value()).toEqual('someGuid');
    expect(component.workoutForm.exercises).toBeDefined();
    expect(component.workoutForm.exercises.length).toBe(NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT);
    expect(component.workoutForm.journal().value()).toBe('');
  });

  it('should get resistance bancs on init', () => {
    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const expectedResults = getResistanceBands();

    //ASSERT
    expect(resistanceBandService.getAllIndividualBands).toHaveBeenCalledTimes(1);
    expect(component.allResistanceBands()).toEqual(expectedResults);
  });

  it('should enable the resistance bands selection modal', () => {
    //ARRANGE
    const setField = getFirstSetField(component);

    //ACT
    component.resistanceBandsModalEnabled(setField);

    //ASSERT
    expect(component.showResistanceBandsSelectModal()).toBe(true);
    expect(component.fieldForResistanceSelection).toBe(setField);
    expect(component.exerciseBandAllocation()).toEqual({
      selectedBandsDelimited: setField().value().resistanceMakeup,
      doubleMaxResistanceAmounts: !setField().value().bandsEndToEnd,
    });
  });

  it('should accept the input from the resistance bands modal', () => {
    //ARRANGE
    const setField = getFirstSetField(component);

    component.resistanceBandsModalEnabled(setField);

    const selection = new ResistanceBandSelection();
    selection.maxResistanceAmount = 60;
    selection.makeup = "Orange, Orange";

    //ACT
    component.resistanceBandsModalAccepted(selection);

    //ASSERT
    expect(component.showResistanceBandsSelectModal()).toBe(false);
    expect(component.fieldForResistanceSelection?.resistanceMakeup().value())
      .toEqual(selection.makeup);
    expect(component.fieldForResistanceSelection?.resistance().value())
      .toEqual(selection.maxResistanceAmount);
  });

  it('should hide the resistance bands select modal when cancelled and not do anything else', () => {
    //ARRANGE
    const setField = getFirstSetField(component);

    component.resistanceBandsModalEnabled(setField);
    const originalMakeup = setField().value().resistanceMakeup;
    const originalResistance = setField().value().resistance;

    //ACT
    component.resistanceBandsModalCancelled();

    //ASSERT
    expect(component.showResistanceBandsSelectModal()).toBe(false);
    expect(setField().value().resistanceMakeup).toBe(originalMakeup);
    expect(setField().value().resistance).toBe(originalResistance);
  });

  it('should show the timer', () => {
    //ARRANGE
    const setField = getFirstSetField(component);

    //ACT
    component.showTimer(setField);

    //ASSERT
    expect(component.fieldForCountdownModal).toBe(setField);
    expect(component.showCountdownModal()).toBe(true);
  });

  it('should complete a workout', () => {
    //ARRANGE
    const executedWorkoutService = TestBed.inject(ExecutedWorkoutService);

    //Fill in the required ratings for every set so the form becomes valid
    const exercises = component.workoutForm.exercises;
    for (let i = 0; i < exercises.length; i++) {
      const sets = exercises[i].exerciseSets;
      for (let j = 0; j < sets.length; j++) {
        sets[j].formRating().value.set('3');
        sets[j].rangeOfMotionRating().value.set('4');
      }
    }

    //ACT
    component.completeWorkout();

    //ASSERT
    expect(executedWorkoutService.update).toHaveBeenCalled();
    expect(component.workoutCompleted()).toBe(true);
  });

  it("should not change the end date of a workout when completing it if it already has an end date", () => {

    //ARRANGE
    const expectedEndDateTime = new Date(2022, 1, 2, 13, 45, 0);
    const workout = <ExecutedWorkoutDTO>{};
    workout.exercises = [];
    workout.startDateTime = new Date(2022, 1, 2, 12, 30, 0);
    workout.endDateTime = expectedEndDateTime;

    const executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    executedWorkoutService.getById =
      vi.mocked(executedWorkoutService.getById).mockReturnValue(of(workout));

    //ACT
    component.ngOnInit(); //Need to reinitialize due to changed mock
    component.completeWorkout();

    //ASSERT
    expect(component.endDateTime()).toEqual(expectedEndDateTime); //Service mock returns the same object
    expect(executedWorkoutService.update).toHaveBeenCalledWith(workout);

  });

  it('should present an error if an undefined ExecutedWorkoutId is provided', () => {
    //ARRANGE
    //Override default behavior
    fixture.componentRef.setInput('executedWorkoutPublicId', undefined);

    const messageService = TestBed.inject(NzMessageService);

    //ACT
    component.ngOnInit(); //Need to reinitialize due to changed mock

    //ASSERT
    expect(messageService.error).toHaveBeenCalledTimes(1);

    //ASSERT
    expect(messageService.error).toHaveBeenCalledWith('executedWorkoutPublicId is invalid. Please exit this page and return to it ' +
      'from one of the pages where a workout can be selected.');
  });

});
