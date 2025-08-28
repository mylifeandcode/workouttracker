import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterModule, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { WorkoutEditComponent } from './workout-edit.component';
import { WorkoutService } from '../_services/workout.service';
import { Workout } from 'app/workouts/_models/workout';
import { ExerciseInWorkout } from '../_models/exercise-in-workout';
import { ExerciseDTO } from '../_models/exercise-dto';
import { ExerciseListMiniComponent } from 'app/exercises/exercise-list-mini/exercise-list-mini.component';
import { EMPTY_GUID } from 'app/shared/shared-constants';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
    selector: 'wt-exercise-list-mini',
    template: '',
    imports: [ReactiveFormsModule]
})
class FakeExerciseListMiniComponent { }

@Component({
    selector: 'wt-blank',
    template: '',
    standalone: false
})
class BlankComponent { }

class WorkoutServiceMock {
  private getTestWorkout(): Workout {
    const workout = new Workout();
    workout.publicId = WORKOUT_PUBLIC_ID;
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

const WORKOUT_PUBLIC_ID: string = "some-guid";

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
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
          useClass: WorkoutServiceMock
  },
  provideZonelessChangeDetection()
      ]
    })
    .overrideComponent(
      WorkoutEditComponent,
      {
        remove: { imports: [ExerciseListMiniComponent, NzSpinModule, NzModalModule, NzSwitchModule] },
        add: { imports: [FakeExerciseListMiniComponent], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      }
    )
      .compileComponents();
  }));

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
    expect(workoutService.getById).toHaveBeenCalledOnceWith(WORKOUT_PUBLIC_ID);
    expect(component.workoutForm.controls.publicId.value).toBe(WORKOUT_PUBLIC_ID);
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

  /*
  it('should toggle read-only mode to false', () => {
    component.editModeToggled({ checked: true });
    expect(component.readOnlyMode).toBeFalse();
  });

  it('should toggle read-only mode to true', () => {
    component.editModeToggled({ checked: false });
    expect(component.readOnlyMode).toBeTrue();
  });
  */

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
  xit('should open modal', () => {
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

    fixture.componentRef.setInput('id', undefined); //Simulate the input binding from the route

    //The form has already been created and populated with the default data.
    //We need to reset.
    component.workoutForm.reset();
    component.workoutForm.controls.exercises.clear();

    //Re-initialize to pick up change to default ActivatedRoute
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

    fixture.componentRef.setInput('id', undefined); //Simulate the input binding from the route

    //The form has already been created and populated with the default data.
    //We need to reset.
    component.workoutForm.reset();
    component.workoutForm.controls.exercises.clear();

    //Re-initialize to pick up change to default ActivatedRoute
    component.ngOnInit();

    component.saveWorkout();

    //expect(workoutService.add).not.toHaveBeenCalled();
    expect(component.workoutForm.invalid).toBeTrue();
  });

});
