import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterModule, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { WorkoutEditComponent } from './workout-edit.component';
import { WorkoutService } from '../_services/workout.service';
import { Workout, ExerciseInWorkout, ExerciseDTO } from '../../api';
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

@Component({
  selector: 'wt-blank',
  template: ''
})
class BlankComponent {
}

const WORKOUT_PUBLIC_ID: string = "some-guid";

function getTestWorkout(): Workout {
  const workout = <Workout>{};
  workout.id = 123;
  workout.publicId = WORKOUT_PUBLIC_ID;
  workout.active = true;
  workout.name = 'Test Workout';
  workout.exercises = [];

  workout.exercises.push(<ExerciseInWorkout>{
    id: 1, exerciseId: 10, sequence: 0, exercise: { name: 'Bench Press' }, setType: 0, numberOfSets: 3, createdByUserId: 0, createdDateTime: new Date()
  });

  workout.exercises.push(<ExerciseInWorkout>{
    id: 2, exerciseId: 20, sequence: 1, exercise: { name: 'Biceps Curls' }, setType: 1, numberOfSets: 4, createdByUserId: 0, createdDateTime: new Date()
  });
  return workout;
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
  let workoutService: WorkoutService;

  //Thanks to Mike Gallagher for the link: https://www.joshuacolvin.net/mocking-activated-route-data-in-angular/

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          { path: 'workouts/edit/:id', component: BlankComponent }
        ]),
        WorkoutEditComponent,
        FakeExerciseListMiniComponent
      ],
      providers: [
        {
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
          useValue: <Partial<Mocked<WorkoutService>>>{
            getById: vi.fn<WorkoutService['getById']>().mockReturnValue(of(getTestWorkout())),
            add: vi.fn<WorkoutService['add']>().mockReturnValue(of(<Workout>{})),
            update: vi.fn<WorkoutService['update']>().mockReturnValue(of(<Workout>{}))
          }
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
    workoutService = TestBed.inject(WorkoutService);
    fixture.detectChanges();
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
    expect(workoutService.getById).toHaveBeenCalledTimes(1);
    expect(workoutService.getById).toHaveBeenCalledWith(WORKOUT_PUBLIC_ID);

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
    expect(workoutService.getById).not.toHaveBeenCalledWith(EMPTY_GUID);
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
    expect(workoutService.add).toHaveBeenCalled();
  });

  it('should update an existing workout', () => {
    component.saveWorkout();
    expect(workoutService.update).toHaveBeenCalled();
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
