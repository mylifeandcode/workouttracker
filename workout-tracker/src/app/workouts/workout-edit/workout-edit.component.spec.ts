import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { WorkoutEditComponent } from './workout-edit.component';
import { WorkoutService } from '../workout.service';
import { Workout } from 'app/workouts/models/workout';
import { ProgressSpinnerComponentMock } from 'app/testing/component-mocks/primeNg/p-progress-spinner-mock';
import { ExerciseInWorkout } from '../models/exercise-in-workout';
import { ExerciseDTO } from '../models/exercise-dto';

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
  add = jasmine.createSpy('add').and.returnValue(of(new Workout()));
  update = jasmine.createSpy('update').and.returnValue(of(new Workout()));
}

const WORKOUT_ID: number = 5;

function getActivatedRouteSnapshot(): ActivatedRouteSnapshot {
  const activatedRouteSnapshot = new ActivatedRouteSnapshot();
  activatedRouteSnapshot.url = [];
  activatedRouteSnapshot.url.push(new UrlSegment('edit', {}));
  activatedRouteSnapshot.params = { 'id': WORKOUT_ID };
  return activatedRouteSnapshot;
}

describe('WorkoutEditComponent', () => {
  let component: WorkoutEditComponent;
  let fixture: ComponentFixture<WorkoutEditComponent>;
  let workoutService: WorkoutService;

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
            }),
            snapshot: getActivatedRouteSnapshot()            
          }
        },
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutEditComponent);
    component = fixture.componentInstance;
    workoutService = TestBed.inject(WorkoutService);
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

  it('should toggle read-only mode to false', () => {
    component.editModeToggled({checked: true});
    expect(component.readOnlyMode).toBeFalse();
  });

  it('should toggle read-only mode to true', () => {
    component.editModeToggled({checked: false});
    expect(component.readOnlyMode).toBeTrue();
  });
  
  it('should not load workout when creating a new one', () => {
    //TODO: Improve this test if possible

    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.params['id'] = 0;

    component.ngOnInit();

    expect(component.workoutId).toBe(0);
    expect(workoutService.getById).not.toHaveBeenCalledWith(0); //The original ngOnInit() call would've called it with WORKOUT_ID
  });

  it('should open modal', () => {
    expect(component.showExerciseSelectModal).toBeFalse();
    component.openModal();
    expect(component.showExerciseSelectModal).toBeTrue();
  });

  it('should add an exerise', () => {
    const startingNumberOfExercises = component.exercisesArray.length;
    component.addExercise(new ExerciseDTO());
    expect(component.exercisesArray.length).toBe(startingNumberOfExercises + 1);
  });

  it('should remove an exercise', () => {
    const startingNumberOfExercises = component.exercisesArray.length;
    const firstExercise = component.exercisesArray.at(0);
    component.removeExercise(1);
    expect(component.exercisesArray.length).toBe(startingNumberOfExercises - 1);
    expect(firstExercise).toBe(component.exercisesArray.at(0));
  });

  it('should move an exercise up', () => {
    const secondExercise = component.exercisesArray.at(1);
    component.moveExerciseUp(1);
    expect(component.exercisesArray.at(0)).toBe(secondExercise);
  });

  it('should move an exercise down', () => {
    const firstExercise = component.exercisesArray.at(0);
    component.moveExerciseDown(0);
    expect(component.exercisesArray.at(1)).toBe(firstExercise);
  });

  it('should add a new workout', () => {
    //TODO: Improve this test if possible

    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.params['id'] = 0;

    component.ngOnInit();
    component.workoutForm.controls.name.setValue('My New Workout');
    component.workoutForm.controls.active.setValue(true);
    const exercise = new ExerciseDTO();
    exercise.id = 101;
    exercise.name = "Weighted Push Ups";
    component.addExercise(exercise);
    component.workoutForm.controls.exercises.controls[0].controls.setType.setValue(1);
    component.workoutForm.controls.exercises.controls[0].controls.numberOfSets.setValue(3);
    component.saveWorkout();

    expect(component.workoutForm.invalid).toBeFalse();
    expect(workoutService.add).toHaveBeenCalled();
  });
  
  it('should update an existing workout', () => {
    component.saveWorkout();
    expect(workoutService.update).toHaveBeenCalled();
  });

  it('should not save a workout if the form is invalid', () => {
    //TODO: Improve this test if possible

    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.params['id'] = 0;

    component.ngOnInit();

    component.saveWorkout();

    expect(workoutService.add).not.toHaveBeenCalled();
    expect(component.workoutForm.invalid).toBeTrue();
  });

});
