import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkoutComponent } from './workout.component';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { ExecutedExercise } from '../models/executed-exercise';
import { Exercise } from '../models/exercise';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';
import { ResistanceBandSelection } from '../models/resistance-band-selection';
import { ResistanceBandSelectComponent } from '../resistance-band-select/resistance-band-select.component';
import { RSA_X931_PADDING } from 'constants';

const MOCK_USER_ID: number = 15;
const NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT = 4;

//HELPER FUNCTIONS ////////////////////////////////////////////////////////////
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
  for(let x = 0; x < NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT; x++) {
    let exercise = new ExecutedExercise();
    exercise.exercise = new Exercise(); //So...yeah. Mistakes were made with the naming. :/
    exercise.exercise.bandsEndToEnd = (x % 2 > 0);
    exercise.exercise.id = x + 1;
    exercise.exercise.name = "Exercise " + x.toString();
    exercise.exercise.resistanceType = x;
    exercise.resistanceAmount = x * 10;
    exercise.resistanceMakeup = exercise.resistanceAmount.toString();
    exercise.targetRepCount = x * 5;
    exercise.setType = ((x + 1) % 2);
    executedWorkout.exercises.push(exercise);
  }

  /*
  Duplicate the last exercise so we can verify the grouping works.
  For example, a workout can have 1 set of push ups and 2 sets of bicep curls.
  In this case, there are 2 DISTINCT exercises in the workout (and 3 executed exercises).
  */
  let lastExercise = executedWorkout.exercises[executedWorkout.exercises.length - 1];
  let oneMoreExercise = new ExecutedExercise();
  oneMoreExercise.exercise = new Exercise();
  oneMoreExercise.exercise.bandsEndToEnd = lastExercise.exercise.bandsEndToEnd;
  oneMoreExercise.exercise.id = lastExercise.exercise.id;
  oneMoreExercise.exercise.name = lastExercise.exercise.name;
  oneMoreExercise.exercise.resistanceType = lastExercise.exercise.resistanceType;
  oneMoreExercise.resistanceAmount = lastExercise.resistanceAmount;
  oneMoreExercise.resistanceMakeup = lastExercise.resistanceMakeup;
  oneMoreExercise.targetRepCount = lastExercise.targetRepCount;
  oneMoreExercise.setType = lastExercise.setType;
  executedWorkout.exercises.push(oneMoreExercise);
  return executedWorkout;
}

function getFirstExerciseFormGroup(component: WorkoutComponent): FormGroup {
  //Reactive Forms can get CONFUSING!
  const firstExercise = component.exercisesArray.controls[0];
  const formGroup = <FormGroup>firstExercise;
  const exerciseSets = (<FormArray>formGroup.controls.exerciseSets).controls;
  return <FormGroup>exerciseSets[0];
}
//END HELPER FUNCTIONS ////////////////////////////////////////////////////////

//SERVICE MOCK CLASSES ////////////////////////////////////////////////////////
class WorkoutServiceMock {
  getAll = jasmine.createSpy('getAll')
    .and.returnValue(of(getFakeUserWorkouts()));
}

class UserServiceMock {
  getCurrentUserInfo = 
    jasmine.createSpy('getCurrentUserInfo')
      .and.returnValue(of(new User({id: MOCK_USER_ID})));
  
  get currentUserId(): number { return MOCK_USER_ID; }
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
//END SERVICE MOCK CLASSES ////////////////////////////////////////////////////

//COMPONENT MOCK CLASSES //////////////////////////////////////////////////////
/*
The casting solution presented at this URL did not work: https://medium.com/angular-in-depth/angular-unit-testing-viewchild-4525e0c7b756
Unfortunately, for now, I've had to mock each property and method. :/
*/
@Component({
  selector: 'wt-resistance-band-select', 
  template: ''
})
class ResistanceBandSelectComponentMock extends ResistanceBandSelectComponent {

  @Input()
  public resistanceBandInventory: ResistanceBandIndividual[];

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

describe('WorkoutComponent', () => {
  let component: WorkoutComponent;
  let fixture: ComponentFixture<WorkoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ], 
      declarations: [ WorkoutComponent, ResistanceBandSelectComponentMock ], 
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
      ], 
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
    component.bandSelect = TestBed.createComponent(ResistanceBandSelectComponentMock).componentInstance;
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
    expect(component.workoutForm.controls.id.value).toBe(12);
    
    expect(component.exercisesArray.controls.length).toBe(NUMBER_OF_DISTINCT_EXERCISES_IN_WORKOUT);

    component.exercisesArray.controls.forEach((value: AbstractControl) => {
      let formGroup = <FormGroup>value;
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
      let exerciseSets = (<FormArray>formGroup.controls.exerciseSets).controls;
      
      expect(exerciseSets).toBeDefined();
      expect(exerciseSets.length).toBeGreaterThan(0);

      let executedExercises = component.workout.exercises.filter((executedExercise: ExecutedExercise) => {
        return executedExercise.exercise.id == formGroup.controls.exerciseId.value; 
      });

      expect(executedExercises.length).toEqual(exerciseSets.length, "exerciseSets.length not as expected.");

      //Make sure each set was initialized correctly
      for(let x = 0; x < exerciseSets.length; x++) {
        const exerciseSetFormGroup = <FormGroup>exerciseSets[x];

        expect(exerciseSetFormGroup.controls.actualReps).toBeDefined();
        expect(exerciseSetFormGroup.controls.bandsEndToEnd).toBeDefined();

        expect(exerciseSetFormGroup.controls.duration).toBeDefined();
        expect(exerciseSetFormGroup.controls.duration.value).toBe(120); //TODO: Refactor required (comment in component)
        expect(exerciseSetFormGroup.controls.resistance).toBeDefined();
        expect(exerciseSetFormGroup.controls.resistanceMakeup).toBeDefined();
        expect(exerciseSetFormGroup.controls.sequence).toBeDefined();
        expect(exerciseSetFormGroup.controls.targetReps).toBeDefined();

        //We can reference [0] for these, as the exercise should be the same if more than one in the group
        expect(exerciseSetFormGroup.controls.bandsEndToEnd.value).toBe(executedExercises[0].exercise.bandsEndToEnd);
        expect(exerciseSetFormGroup.controls.resistance.value).toBe(executedExercises[0].resistanceAmount);
        expect(exerciseSetFormGroup.controls.resistanceMakeup.value).toBe(executedExercises[0].resistanceMakeup);
        expect(exerciseSetFormGroup.controls.targetReps.value).toBe(executedExercises[0].targetRepCount);
      }

    });

  });

  it('should enable the resistance bands selection modal', () => {
    //ARRANGE
    component.workoutSelected(12);
    const exerciseFormGroup = getFirstExerciseFormGroup(component);
 
    //ACT
    component.resistanceBandsModalEnabled(exerciseFormGroup);

    //ASSERT
    expect(component.showResistanceBandsSelectModal).toBeTrue();
    expect(component.formGroupForResistanceSelection).toBe(exerciseFormGroup);
    expect(component.bandSelect.setBandAllocation)
      .toHaveBeenCalledWith(
        exerciseFormGroup.controls.resistanceMakeup.value, 
        !exerciseFormGroup.controls.bandsEndToEnd.value);
  });

  it('should accept the input from the resistance bands modal', () => {
    //ARRANGE
    component.workoutSelected(12);
    const exerciseFormGroup = getFirstExerciseFormGroup(component);
 
    component.resistanceBandsModalEnabled(exerciseFormGroup);
    
    let selection = new ResistanceBandSelection();
    selection.maxResistanceAmount = 60;
    selection.makeup = "Orange, Orange";

    //ACT
    component.resistanceBandsModalAccepted(selection);

    //ASSERT
    expect(component.showResistanceBandsSelectModal).toBeFalse();
    expect(component.formGroupForResistanceSelection.controls.resistanceMakeup.value)
      .toEqual(selection.makeup);
    expect(component.formGroupForResistanceSelection.controls.resistance.value)
      .toEqual(selection.maxResistanceAmount);
  });

  it('should hide the resistance bands select modal when cancelled and not do anything else', () => {
    //ARRANGE
    component.workoutSelected(12);
    const exerciseFormGroup = getFirstExerciseFormGroup(component);
 
    component.resistanceBandsModalEnabled(exerciseFormGroup);

    //ACT
    component.resistanceBandsModalCancelled();

    //ASSERT
    expect(component.showResistanceBandsSelectModal).toBeFalse();
    expect(component.formGroupForResistanceSelection.controls.resistanceMakeup.value)
      .toBe(exerciseFormGroup.controls.resistanceMakeup.value);
    expect(component.formGroupForResistanceSelection.controls.resistance.value)
      .toBe(exerciseFormGroup.controls.resistance.value);
  });

  it('should show the timer', () => {
    //ARRANGE
    component.workoutSelected(12);
    const exerciseFormGroup = getFirstExerciseFormGroup(component);    

    //ACT
    component.showTimer(exerciseFormGroup);

    //ASSERT
    expect(component.formGroupForCountdownModal).toBe(exerciseFormGroup);
    expect(component.showCountdownModal).toBeTrue();
  });

  it('should start a workout', () => {
    //ARRANGE
    component.workoutSelected(12);

    //ACT
    component.startWorkout();

    //ASSERT
    expect(component.workout).toBeDefined();
    expect(component.workout.startDateTime).not.toBeNull();
    expect(component.workoutForm.controls.journal.enabled).toBeTrue();
    expect(component.workoutForm.controls.exercises.enabled).toBeTrue();
    expect(component.workout.createdByUserId).toEqual(MOCK_USER_ID);
  });

  //TODO: Complete
  xit('should complete a workout', () => {
    //ARRANGE
    component.workoutSelected(12);
    component.startWorkout();

    component.workoutForm.patchValue({journal: '38 degrees, sunny. ST: TOS - \"The Omega Glory\" and YouTube'});

    component.exercisesArray.controls.forEach((value: AbstractControl) => {
      let formGroup = <FormGroup>value;
      let sets: FormArray = <FormArray>formGroup.controls.exerciseSets.value;
      console.log("sets: ", sets);

      for(var x = 0; x < sets.length; x++) {
        let setFormGroup: FormGroup = <FormGroup>sets[x];
        setFormGroup.patchValue({ actualReps: x });
      }

      /*
      let sets = <FormArray>formGroup.controls.exerciseSets.value;
      let exerciseId = formGroup.controls.exerciseId.value;
      let exercises = this.workout.exercises.filter((exercise: ExecutedExercise) => {
        return exercise.exercise.id == exerciseId; 
      });

      exercises = exercises.sort((a: ExecutedExercise, b: ExecutedExercise) => a.sequence - b.sequence);

      if(exercises.length != sets.length) {
        window.alert("Exercises/FormArray length mismatch."); //TODO: Handle this a better way
        return;
      }

      for(let x = 0; x < exercises.length; x++) {
        exercises[x].actualRepCount = sets[x].actualReps;
        exercises[x].duration = sets[x].duration;
        //exercises[x].notes //TODO: Implement
        exercises[x].resistanceAmount = sets[x].resistance;
        exercises[x].resistanceMakeup = sets[x].resistanceMakeup;
        exercises[x].targetRepCount = sets[x].targetReps;
        exercises[x].sequence = x;
        exercises[x].formRating = sets[x].formRating;
        exercises[x].rangeOfMotionRating = sets[x].rangeOfMotionRating;
      }
      */

    });
    
    //this.workout.endDateTime = new Date();

    //ACT
    component.completeWorkout();

    //ASSERT
  });
});
