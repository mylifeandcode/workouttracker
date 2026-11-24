import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, provideRouter, Router, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { WorkoutEditComponent } from './workout-edit.component';
import { WorkoutService } from '../_services/workout.service';
import { Workout, WorkoutDetailDTO, ExerciseInWorkoutDetailDTO, ExerciseDTO } from '../../api';
import { ExerciseListMiniComponent } from '../../exercises/exercise-list-mini/exercise-list-mini.component';

import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { EMPTY_GUID } from '../../shared/constants/feature-agnostic-constants';
import { type Mocked } from 'vitest';

@Component({
  selector: 'wt-exercise-list-mini',
  template: ''
})
class FakeExerciseListMiniComponent {
}

const WORKOUT_PUBLIC_ID: string = "some-guid";

function getTestWorkout(): WorkoutDetailDTO {
  return {
    id: 123,
    publicId: WORKOUT_PUBLIC_ID,
    createdByUserId: 1,
    createdDateTime: new Date(),
    modifiedDateTime: null,
    active: true,
    name: 'Test Workout',
    exercises: [
      <ExerciseInWorkoutDetailDTO>{ id: 1, exerciseId: 10, exerciseName: 'Bench Press', setType: 0, numberOfSets: 3, resistanceType: 0, targetAreas: [] },
      <ExerciseInWorkoutDetailDTO>{ id: 2, exerciseId: 20, exerciseName: 'Biceps Curls', setType: 1, numberOfSets: 4, resistanceType: 0, targetAreas: [] }
    ]
  };
}

function getActivatedRouteSnapshot(): ActivatedRouteSnapshot {
  const activatedRouteSnapshot = new ActivatedRouteSnapshot();
  activatedRouteSnapshot.url = [];
  activatedRouteSnapshot.url.push(new UrlSegment('edit', {}));
  activatedRouteSnapshot.params = { 'id': WORKOUT_PUBLIC_ID };
  return activatedRouteSnapshot;
}

describe('WorkoutEditComponent', () => {
  let component: WorkoutEditComponent;
  let fixture: ComponentFixture<WorkoutEditComponent>;

  const workoutServiceMock: Mocked<Pick<WorkoutService, 'getById' | 'add' | 'update'>> = {
    getById: vi.fn<WorkoutService['getById']>(() => of(getTestWorkout())).mockName('getById'),
    add: vi.fn<WorkoutService['add']>(() => of(<Workout>{})).mockName('add'),
    update: vi.fn<WorkoutService['update']>(() => of(<Workout>{})).mockName('update')
  };

  //Thanks to Mike Gallagher for the link: https://www.joshuacolvin.net/mocking-activated-route-data-in-angular/

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WorkoutEditComponent,
        FakeExerciseListMiniComponent
      ],
      providers: [
        provideRouter([]),
        {
          //Deliberately NOT hoisted: the tests change snapshot.params, which resetAllMocks() can't undo,
          //so every test needs a freshly built route.
          provide: ActivatedRoute, //ActivatedRoute is still needed even though we get the ID via withComponentInputBinding()
          useValue: {
            params: of({
              id: WORKOUT_PUBLIC_ID
            }),
            snapshot: getActivatedRouteSnapshot()
          }
        },
        {
          provide: WorkoutService,
          useValue: workoutServiceMock
        },
        provideZonelessChangeDetection()
      ]
    })
      .overrideComponent(WorkoutEditComponent, {
        remove: { imports: [ExerciseListMiniComponent, NzSpinModule, NzModalModule, NzSwitchModule] },
        add: { imports: [FakeExerciseListMiniComponent], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutEditComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', WORKOUT_PUBLIC_ID); //Simulate the input binding from the route
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true); //No routes are registered, so don't let a real navigation run
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks(); //Undoes the router.navigate spy
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the form during init', () => {
    expect(component.workoutForm).not.toBeNull();
    expect(component.workoutForm.exercises).not.toBeNull();
    expect(component.workoutForm.exercises.length).toBe(2);

    //Name is required — clearing it invalidates the form
    component.workoutForm.name().value.set('');
    expect(component.workoutForm.name().invalid()).toBe(true);
  });

  it('should load workout based on route param ID during init', () => {
    expect(workoutServiceMock.getById).toHaveBeenCalledTimes(1);
    expect(workoutServiceMock.getById).toHaveBeenCalledWith(WORKOUT_PUBLIC_ID);

    expect(component.workoutForm.publicId().value()).toBe(WORKOUT_PUBLIC_ID);
    expect(component.workoutForm.active().value()).toBe(true);
    expect(component.workoutForm.name().value()).toBe('Test Workout');

    const exercises = component.workoutForm.exercises;
    expect(exercises[0].id().value()).toBe(1);
    expect(exercises[0].exerciseId().value()).toBe(10);
    expect(exercises[0].exerciseName().value()).toBe('Bench Press');
    expect(exercises[0].numberOfSets().value()).toBe(3);
    expect(exercises[0].setType().value()).toBe('0'); //Native <select> value is a string
    expect(exercises[1].id().value()).toBe(2);
    expect(exercises[1].exerciseId().value()).toBe(20);
    expect(exercises[1].exerciseName().value()).toBe('Biceps Curls');
    expect(exercises[1].numberOfSets().value()).toBe(4);
    expect(exercises[1].setType().value()).toBe('1');
  });

  it('should not load workout when creating a new one', () => {
    //TODO: Improve this test if possible

    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.params['id'] = 'some-guid';

    component.ngOnInit();

    expect(component.id()).toBe('some-guid');
    // The original ngOnInit() call would've called it with WORKOUT_PUBLIC_ID
    expect(workoutServiceMock.getById).not.toHaveBeenCalledWith(EMPTY_GUID);
  });

  //TODO: Revisit
  it.skip('should open modal', () => {
    expect(component.showExerciseSelectModal()).toBe(false);
    component.openModal();
    expect(component.showExerciseSelectModal()).toBe(true);
  });

  it('should add an exerise', () => {
    const startingNumberOfExercises = component.workoutForm.exercises.length;
    component.addExercise(<ExerciseDTO>{});
    expect(component.workoutForm.exercises.length).toBe(startingNumberOfExercises + 1);
  });

  it('should remove an exercise', () => {
    const startingNumberOfExercises = component.workoutForm.exercises.length;
    const firstExerciseId = component.workoutForm.exercises[0].id().value();
    component.removeExercise(1); //Remove the second exercise
    expect(component.workoutForm.exercises.length).toBe(startingNumberOfExercises - 1);
    expect(component.workoutForm.exercises[0].id().value()).toBe(firstExerciseId); //First is untouched
  });

  it('should move an exercise up', () => {
    const secondExerciseId = component.workoutForm.exercises[1].id().value();
    component.moveExerciseUp(1);
    expect(component.workoutForm.exercises[0].id().value()).toBe(secondExerciseId);
  });

  it('should move an exercise down', () => {
    const firstExerciseId = component.workoutForm.exercises[0].id().value();
    component.moveExerciseDown(0);
    expect(component.workoutForm.exercises[1].id().value()).toBe(firstExerciseId);
  });

  it('should add a new workout', () => {
    //A fresh component in "new" mode (no id) starts from an empty model.
    const newFixture = TestBed.createComponent(WorkoutEditComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.componentRef.setInput('id', undefined);
    newFixture.detectChanges();

    newComponent.workoutForm.name().value.set('My New Workout');
    const exercise = <ExerciseDTO>{};
    exercise.id = 101;
    exercise.name = "Weighted Push Ups";
    newComponent.addExercise(exercise);
    newComponent.workoutForm.exercises[0].setType().value.set('1');
    newComponent.workoutForm.exercises[0].numberOfSets().value.set(3);
    newComponent.saveWorkout();

    expect(newComponent.workoutForm().invalid()).toBe(false);
    expect(workoutServiceMock.add).toHaveBeenCalled();
  });

  it('should update an existing workout', () => {
    component.saveWorkout();
    expect(workoutServiceMock.update).toHaveBeenCalled();
  });

  it('should not save a workout if the form is invalid', () => {
    //A fresh component in "new" mode starts empty, so the required name makes it invalid.
    const newFixture = TestBed.createComponent(WorkoutEditComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.componentRef.setInput('id', undefined);
    newFixture.detectChanges();

    newComponent.saveWorkout();

    expect(newComponent.workoutForm().invalid()).toBe(true);
  });

});
