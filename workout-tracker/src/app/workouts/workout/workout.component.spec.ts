import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkoutComponent } from './workout.component';
import { AbstractControl, UntypedFormArray, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { WorkoutService } from '../_services/workout.service';
import { of } from 'rxjs';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { WorkoutDTO } from 'app/workouts/_models/workout-dto';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { ResistanceBandService } from 'app/shared/services/resistance-band.service';
import { ExecutedWorkoutDTO } from '../_models/executed-workout-dto';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedExerciseDTO } from '../_models/executed-exercise-dto';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output, input } from '@angular/core';
import { ResistanceBandSelection } from '../_models/resistance-band-selection';
import { ResistanceBandSelectComponent } from '../_shared/resistance-band-select/resistance-band-select.component';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { MessageService } from 'primeng/api';
import { groupBy } from 'lodash-es';
import { Dictionary } from 'lodash';
import { WorkoutExerciseComponent } from './workout-exercise/workout-exercise.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { DurationComponent } from '../_shared/duration/duration.component';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzSpinModule } from 'ng-zorro-antd/spin';

const MOCK_USER_ID: number = 15;
const NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT = 4;

//HELPER FUNCTIONS ////////////////////////////////////////////////////////////
const getFakeUserWorkouts = (): PaginatedResults<WorkoutDTO> => {
  const workouts = new PaginatedResults<WorkoutDTO>();
  workouts.totalCount = 3;
  for (let x = 0; x < workouts.totalCount; x++) {
    workouts.results = new Array<WorkoutDTO>();
    workouts.results.push(new WorkoutDTO());
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
  const executedWorkout = new ExecutedWorkoutDTO();

  executedWorkout.name = "Fake Workout";
  executedWorkout.exercises = [];
  for (let x = 0; x < NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT; x++) {
    const exercise = new ExecutedExerciseDTO();

    exercise.bandsEndToEnd = (x % 2 > 0);
    exercise.exerciseId = x + 1;
    exercise.name = "Exercise " + x.toString();
    exercise.resistanceType = x;
    exercise.resistanceAmount = x * 10;
    exercise.resistanceMakeup = exercise.resistanceAmount.toString();
    exercise.targetRepCount = x * 5;
    exercise.setType = ((x + 1) % 2);
    exercise.sequence = x;
    executedWorkout.exercises.push(exercise);
  }

  /*
  Duplicate the last exercise so we can verify the grouping works.
  For example, a workout can have 1 set of push ups and 2 sets of bicep curls.
  In this case, there are 2 DISTINCT exercises in the workout (and 3 executed exercises).
  */
  const lastExercise = executedWorkout.exercises[executedWorkout.exercises.length - 1];
  const oneMoreExercise = new ExecutedExerciseDTO();

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

function getFirstExerciseFormGroup(component: WorkoutComponent): UntypedFormGroup {
  //Reactive Forms can get CONFUSING!
  const firstExercise = component.exercisesArray.controls[0];
  const formGroup = <UntypedFormGroup>firstExercise;
  const exerciseSets = (<UntypedFormArray>formGroup.controls.exerciseSets).controls;
  return <UntypedFormGroup>exerciseSets[0];
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}
//END HELPER FUNCTIONS ////////////////////////////////////////////////////////

//SERVICE MOCK CLASSES ////////////////////////////////////////////////////////
class WorkoutServiceMock {
  getFilteredSubset = jasmine.createSpy('getFilteredSubset')
    .and.returnValue(of(getFakeUserWorkouts()));
}

class ResistanceBandServiceMock {
  getAllIndividualBands =
    jasmine.createSpy('getAllIndividualBands')
      .and.returnValue(of(getResistanceBands()));
}

class ExecutedWorkoutServiceMock {
  //getNew = jasmine.createSpy('getNew').and.returnValue(of(getFakeExecutedWorkout()));
  add = jasmine.createSpy('add').and.callFake((workout: ExecutedWorkoutDTO) => of(workout));
  getById = jasmine.createSpy('getById').and.returnValue(of(getFakeExecutedWorkout()));

  public groupExecutedExercises(exercises: ExecutedExerciseDTO[]): Dictionary<ExecutedExerciseDTO[]> {
    const sortedExercises: ExecutedExerciseDTO[] = exercises.sort((a: ExecutedExerciseDTO, b: ExecutedExerciseDTO) => a.sequence - b.sequence);

    const groupedExercises = groupBy(exercises, (exercise: ExecutedExerciseDTO) =>
      exercise.exerciseId.toString() + '-' + exercise.setType.toString()
    );
    return groupedExercises;
  }

  update = jasmine.createSpy('update')
    .and.callFake((workout: ExecutedWorkoutDTO) => of(workout));
}

class ActivatedRouteMock {
  public snapshot: ActivatedRouteSnapshot;

  constructor() {
    this.snapshot = new ActivatedRouteSnapshot();
    this.snapshot.params = { executedWorkoutPublicId: 'someGuid' };
    this.snapshot.queryParams = {};
  }
}

class MessageServiceMock {
  add = jasmine.createSpy('add');
  clear = jasmine.createSpy('clear');
}
//END SERVICE MOCK CLASSES ////////////////////////////////////////////////////

//COMPONENT MOCK CLASSES //////////////////////////////////////////////////////
/*
The casting solution presented at this URL did not work: https://medium.com/angular-in-depth/angular-unit-testing-viewchild-4525e0c7b756
Unfortunately, for now, I've had to mock each property and method. :/
*/
@Component({
    selector: 'wt-resistance-band-select',
    template: '',
    imports: [ReactiveFormsModule]
})
class MockResistanceBandSelectComponent extends ResistanceBandSelectComponent {

  public readonly resistanceBandInventory = input<ResistanceBandIndividual[]>([]);

  @Output()
  public okClicked: EventEmitter<ResistanceBandSelection> = new EventEmitter<ResistanceBandSelection>();

  @Output()
  public cancelClicked: EventEmitter<void> = new EventEmitter<void>();

  /*
  public selectedBands: ResistanceBandIndividual[] = [];
  public availableBands: ResistanceBandIndividual[] = [];
  */

  setBandAllocation = jasmine.createSpy('setBandAllocation');

  /*
  ok = jasmine.createSpy('ok');
  cancel = jasmine.createSpy('cancel');

  public get maxAvailableResistance(): number {
    return 0;
  }

  public get maxSelectedResistance(): number {
    return 0;
  }

  //private _doubleMaxResistanceAmounts: boolean;

  ngOnInit(): void {
  }
  */
}

//END COMPONENT MOCK CLASSES //////////////////////////////////////////////////
//TODO: Repair and augment -- refactoring the component destroyed this spec! :O
describe('WorkoutComponent', () => {
  let component: WorkoutComponent;
  let fixture: ComponentFixture<WorkoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        WorkoutComponent,
        MockResistanceBandSelectComponent,
        BrowserAnimationsModule
      ],
      providers: [
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
        },
        {
          provide: ResistanceBandService,
          useClass: ResistanceBandServiceMock
        },
        {
          provide: ExecutedWorkoutService,
          useClass: ExecutedWorkoutServiceMock
        },
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteMock
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(
        WorkoutComponent,
        {
          remove:
          {
            imports: [
              WorkoutExerciseComponent,
              ResistanceBandSelectComponent,
              CountdownTimerComponent,
              DurationComponent,
              ToastModule,
              AccordionModule,
              NzSpinModule
            ]
          },
          add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutComponent);
    component = fixture.componentInstance;

    //The below line works, but bandSelect becomes undefined after detectChanges(), most likely
    //due to the HTML element not being rendered due to the visible attribute being false
    //component.bandSelect = TestBed.createComponent(ResistanceBandSelectComponentMock).componentInstance;

    fixture.detectChanges();

    //IMPORTANT: Need to set this AFTER detectChanges, because otherwise it is undefined (probably due to the visible attribute being false)
    component.bandSelect = TestBed.createComponent(MockResistanceBandSelectComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create FormGroup on init', () => {
    expect(component.workoutForm).toBeDefined();
    expect(component.workoutForm.controls.publicId.value).toEqual('someGuid');
    expect(component.workoutForm.controls.exercises).toBeDefined();
    expect(component.workoutForm.controls.journal.value).toBe('');
  });

  it('should get resistance bancs on init', () => {
    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const expectedResults = getResistanceBands();

    //ASSERT
    expect(resistanceBandService.getAllIndividualBands).toHaveBeenCalledTimes(1);
    expect(component.allResistanceBands).toEqual(expectedResults);
  });

  //TODO: Fix
  xit('should set up workout when selected', () => {
    //ARRANGE
    const executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    const expectedExecutedWorkout = getFakeExecutedWorkout();

    //ACT
    //component.workoutSelected(12);

    //ASSERT
    //expect(executedWorkoutService.getNew).toHaveBeenCalledTimes(1);
    //expect(component._executedWorkout).toEqual(expectedExecutedWorkout);
    expect(component.workoutForm.controls.publicId.value).toBe('someGuid');

    expect(component.exercisesArray.controls.length).toBe(NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT);

    component.exercisesArray.controls.forEach((value: AbstractControl) => {
      const formGroup = <UntypedFormGroup>value;
      expect(formGroup).toBeDefined();
      expect(formGroup.controls.id).toBeDefined();
      //expect(formGroup.controls.id.value).toBe(0); //TODO: Revisit -- similar comment in component
      expect(formGroup.controls.exerciseId).toBeDefined();
      expect(formGroup.controls.exerciseId.value).toBeGreaterThan(0);
      expect(formGroup.controls.exerciseName).toBeDefined();
      expect(formGroup.controls.setType).toBeDefined();
      expect(formGroup.controls.resistanceType).toBeDefined();

      //let exerciseSets = <FormArray>formGroup.controls.exerciseSets.value;
      //IMPORTANT DISTINCTION:
      //The above approach only gets any values which were set.
      //The *below* approach gets the controls we've defined.
      const exerciseSets = (<UntypedFormArray>formGroup.controls.exerciseSets).controls;

      expect(exerciseSets).toBeDefined();
      expect(exerciseSets.length).toBeGreaterThan(0);

      //const executedExercises = component._executedWorkout.exercises.filter((executedExercise: ExecutedExerciseDTO) => executedExercise.exercise.id == formGroup.controls.exerciseId.value);

      //expect(executedExercises.length).toEqual(exerciseSets.length, "exerciseSets.length not as expected.");

      //Make sure each set was initialized correctly
      for (let x = 0; x < exerciseSets.length; x++) {
        const exerciseSetFormGroup = <UntypedFormGroup>exerciseSets[x];

        expect(exerciseSetFormGroup.controls.actualReps).toBeDefined();
        expect(exerciseSetFormGroup.controls.bandsEndToEnd).toBeDefined();

        expect(exerciseSetFormGroup.controls.duration).toBeDefined();
        expect(exerciseSetFormGroup.controls.duration.value).toBe(120); //TODO: Refactor required (comment in component)
        expect(exerciseSetFormGroup.controls.resistance).toBeDefined();
        expect(exerciseSetFormGroup.controls.resistanceMakeup).toBeDefined();
        expect(exerciseSetFormGroup.controls.sequence).toBeDefined();
        expect(exerciseSetFormGroup.controls.targetReps).toBeDefined();

        //We can reference [0] for these, as the exercise should be the same if more than one in the group
        //expect(exerciseSetFormGroup.controls.bandsEndToEnd.value).toBe(executedExercises[0].bandsEndToEnd);
        //expect(exerciseSetFormGroup.controls.resistance.value).toBe(executedExercises[0].resistanceAmount);
        //expect(exerciseSetFormGroup.controls.resistanceMakeup.value).toBe(executedExercises[0].resistanceMakeup);
        //expect(exerciseSetFormGroup.controls.targetReps.value).toBe(executedExercises[0].targetRepCount);
      }

    });

  });

  it('should enable the resistance bands selection modal', () => {
    //ARRANGE
    //component.workoutSelected(12);
    const exerciseFormGroup = getFirstExerciseFormGroup(component);

    //ACT
    component.resistanceBandsModalEnabled(exerciseFormGroup);

    //ASSERT
    expect(component.showResistanceBandsSelectModal).toBeTrue();
    expect(component.formGroupForResistanceSelection).toBe(exerciseFormGroup);
    expect(component.bandSelect?.setBandAllocation)
      .toHaveBeenCalledWith(
        exerciseFormGroup.controls.resistanceMakeup.value,
        !exerciseFormGroup.controls.bandsEndToEnd.value);
  });

  it('should accept the input from the resistance bands modal', () => {
    //ARRANGE
    //component.workoutSelected(12);
    const exerciseFormGroup = getFirstExerciseFormGroup(component);

    component.resistanceBandsModalEnabled(exerciseFormGroup);

    const selection = new ResistanceBandSelection();
    selection.maxResistanceAmount = 60;
    selection.makeup = "Orange, Orange";

    //ACT
    component.resistanceBandsModalAccepted(selection);

    //ASSERT
    expect(component.showResistanceBandsSelectModal).toBeFalse();
    expect(component.formGroupForResistanceSelection?.controls.resistanceMakeup.value)
      .toEqual(selection.makeup);
    expect(component.formGroupForResistanceSelection?.controls.resistance.value)
      .toEqual(selection.maxResistanceAmount);
  });

  it('should hide the resistance bands select modal when cancelled and not do anything else', () => {
    //ARRANGE
    const exerciseFormGroup = getFirstExerciseFormGroup(component);

    component.resistanceBandsModalEnabled(exerciseFormGroup);

    //ACT
    component.resistanceBandsModalCancelled();

    //ASSERT
    expect(component.showResistanceBandsSelectModal).toBeFalse();
    expect(component.formGroupForResistanceSelection?.controls.resistanceMakeup.value)
      .toBe(exerciseFormGroup.controls.resistanceMakeup.value);
    expect(component.formGroupForResistanceSelection?.controls.resistance.value)
      .toBe(exerciseFormGroup.controls.resistance.value);
  });

  it('should show the timer', () => {
    //ARRANGE
    //component.workoutSelected(12);
    const exerciseFormGroup = getFirstExerciseFormGroup(component);

    //ACT
    component.showTimer(exerciseFormGroup);

    //ASSERT
    expect(component.formGroupForCountdownModal).toBe(exerciseFormGroup);
    expect(component.showCountdownModal).toBeTrue();
  });

  it('should start a workout', () => {
    //ARRANGE
    //component.workoutSelected(12);

    //ACT
    component.startWorkout();

    //ASSERT
    expect(component.workoutForm.controls.journal.enabled).toBeTrue();
    expect(component.workoutForm.controls.exercises.enabled).toBeTrue();
  });

  //TODO: Fix
  xit('should complete a workout', () => {
    //ARRANGE
    const executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    //component.workoutSelected(12);
    component.startWorkout();

    component.workoutForm.patchValue({ journal: '38 degrees, sunny. ST: TOS - \"The Omega Glory\" and YouTube' });

    const expectedExecutedWorkout = new ExecutedWorkoutDTO();
    //expectedExecutedWorkout.createdByUserId = MOCK_USER_ID;
    expectedExecutedWorkout.startDateTime = component.startDateTime;
    expectedExecutedWorkout.journal = component.workoutForm.controls.journal.value;
    expectedExecutedWorkout.exercises = [];

    //Loop through exercises FormArray and patch values into the controls to simulate the info
    //the user has entered
    component.exercisesArray.controls.forEach((value: AbstractControl) => {
      //Remember, each control in the exercises array is a FormGroup
      const formGroup = <UntypedFormGroup>value;

      //Each exercise has a FormArray of exercise sets
      const sets = <UntypedFormArray>formGroup.controls.exerciseSets;
      //sets.controls.forEach(set => {
      for (let x = 0; x < sets.controls.length; x++) {

        const setGroup = <UntypedFormGroup>sets.controls[x];
        setGroup.patchValue({
          actualReps: getRandomInt(10),
          duration: getRandomInt(240),
          formRating: getRandomInt(5),
          rangeOfMotionRating: getRandomInt(5),
          resistance: getRandomInt(200),
          resistanceMakeup: getRandomInt(1000).toString(),
          sequence: x
        });

        const executedExercise = new ExecutedExerciseDTO();
        executedExercise.actualRepCount = setGroup.controls.actualReps.value;
        executedExercise.targetRepCount = setGroup.controls.targetReps.value;

        executedExercise.exerciseId = formGroup.controls.exerciseId.value;
        executedExercise.bandsEndToEnd = setGroup.controls.bandsEndToEnd.value;
        executedExercise.name = formGroup.controls.exerciseName.value;
        executedExercise.resistanceType = formGroup.controls.resistanceType.value;
        executedExercise.duration = setGroup.controls.duration.value;
        executedExercise.formRating = setGroup.controls.formRating.value;
        executedExercise.rangeOfMotionRating = setGroup.controls.rangeOfMotionRating.value;
        executedExercise.resistanceAmount = setGroup.controls.resistance.value;
        executedExercise.resistanceMakeup = setGroup.controls.resistanceMakeup.value;
        executedExercise.setType = formGroup.controls.setType.value;
        executedExercise.sequence = setGroup.controls.sequence.value;
        expectedExecutedWorkout.exercises.push(executedExercise);

      };

    });

    //ACT
    component.completeWorkout();
    expectedExecutedWorkout.endDateTime = component.endDateTime;

    //ASSERT
    expect(executedWorkoutService.add).toHaveBeenCalledWith(expectedExecutedWorkout);
    expect(component.workoutCompleted).toBeTrue();
    expect(component.infoMsg).toContain('Completed workout saved');
  });

  it('should set isLoggingPastWorkout value to true when query param is present and true', () => {

    //ARRANGE
    //Override default mock behavior
    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.queryParams['pastWorkout'] = true;

    //ACT
    //We need to reinit because we changed the ActivatedRoute mock
    component.ngOnInit();

    //ASSERT
    expect(component.isLoggingPastWorkout).toBeTrue();
  });

  it('should set isLoggingPastWorkout value to false when query param is present and false', () => {

    //ARRANGE
    //Override default mock behavior
    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.queryParams['pastWorkout'] = false;

    //ACT
    //We need to reinit because we changed the ActivatedRoute mock
    component.ngOnInit();

    //ASSERT
    expect(component.isLoggingPastWorkout).toBeFalse();
  });

  it('should have values of false for isLoggingPastWorkout when query param not present', () => {

    //ARRANGE
    //Override default mock behavior
    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.queryParams = {};

    //ACT
    //We need to reinit because we changed the ActivatedRoute mock
    component.ngOnInit();

    //ASSERT
    expect(component.isLoggingPastWorkout).toBeFalse();
  });

  it("should not change the end date of a workout when completing it if it already has an end date", () => {

    //ARRANGE
    const expectedEndDateTime = new Date(2022, 1, 2, 13, 45, 0);
    const workout = new ExecutedWorkoutDTO();
    workout.exercises = [];
    workout.startDateTime = new Date(2022, 1, 2, 12, 30, 0);
    workout.endDateTime = expectedEndDateTime;

    //component._executedWorkout = workout;

    const executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    executedWorkoutService.getById =
      jasmine.createSpy('getById').and.returnValue(of(workout));

    //ACT
    component.ngOnInit(); //Need to reinitialize due to changed mock
    component.completeWorkout();

    //ASSERT
    expect(component.endDateTime).toBe(expectedEndDateTime); //Service mock returns the same object
    expect(executedWorkoutService.update).toHaveBeenCalledWith(workout);

  });

  it('should present an error if an invalid ExecutedWorkoutId is found in the route params', () => {
    //ARRANGE
    //Override default mock behavior
    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.params['executedWorkoutPublicId'] = null;

    const messageService = TestBed.inject(MessageService);

    //ACT
    component.ngOnInit(); //Need to reinitialize due to changed mock

    //ASSERT
    expect(messageService.add).toHaveBeenCalledOnceWith({ severity: 'error', summary: 'Error', detail: 'executedWorkoutPublicId is invalid. Please exit this page and return to it from one of the pages where a workout can be selected.', closable: true });
  });

});
