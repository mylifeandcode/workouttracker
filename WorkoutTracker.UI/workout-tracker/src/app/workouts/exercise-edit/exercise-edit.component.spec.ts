import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

import { ExerciseEditComponent } from './exercise-edit.component';
import { ExerciseService } from '../exercise.service';
import { UserService } from 'app/core/user.service';
import { User } from 'app/core/models/user';
import { TargetArea } from 'app/workouts/models/target-area';
import { Exercise } from 'app/workouts/models/exercise';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

const USER_ID: number = 5;

class ExerciseServiceMock {
  resistanceTypes: Map<number, string> = new Map<number, string>();

  constructor() {
    //this.resistanceTypes = new Map<number, string>();
    this.resistanceTypes.set(0, 'Free Weight');
    this.resistanceTypes.set(1, 'Resistance Band');
    console.log("RESISTANCE TYPES: ", this.resistanceTypes);
  }

  getTargetAreas = jasmine.createSpy('getTargetAreas').and.returnValue(of(new Array<TargetArea>()));
  getById = jasmine.createSpy('getById').and.returnValue(of(new Exercise()));
  getResistanceTypes =
    jasmine.createSpy('getResistanceTypes')
      .and.returnValue(of(this.resistanceTypes));
}

class UserServiceMock {
  getCurrentUserInfo =
    jasmine.createSpy('getCurrentUserInfo')
      .and.returnValue(of(new User({ id: USER_ID })));
}

describe('ExerciseEditComponent', () => {
  let component: ExerciseEditComponent;
  let fixture: ComponentFixture<ExerciseEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExerciseEditComponent
      ],
      imports: [
        ProgressSpinnerModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TableModule
       ],
       providers: [
         {
           provide: ExerciseService,
           useClass: ExerciseServiceMock
         },
         {
           provide: UserService,
           useClass: UserServiceMock
         },
         {
           provide: ActivatedRoute,
           useValue: {
             params: of({
               id: 2,
             })
            }
         }
       ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get exercise when id is not 0', waitForAsync(() => {
    const exerciseService: ExerciseService = TestBed.inject(ExerciseService);
    fixture.whenStable().then(() => {
      expect(exerciseService.getById).toHaveBeenCalled();
      expect(component.currentUserId).not.toBeNull();
    });
  }));

  it('should create form', waitForAsync(() => {
    fixture.whenStable().then(() => {
      expect(component.exerciseForm).toBeTruthy();
      expect(component.exerciseForm.controls.id).toBeTruthy();
      expect(component.exerciseForm.controls.name).toBeTruthy();
      expect(component.exerciseForm.controls.description).toBeTruthy();
      expect(component.exerciseForm.controls.resistanceTypes).toBeTruthy();
      expect(component.exerciseForm.controls.oneSided).toBeTruthy();
      expect(component.exerciseForm.controls.targetAreas).toBeTruthy();
      expect(component.exerciseForm.controls.setup).toBeTruthy();
      expect(component.exerciseForm.controls.movement).toBeTruthy();
      expect(component.exerciseForm.controls.pointsToRemember).toBeTruthy();
    });
  }));

  it('should get the current user ID', waitForAsync(() => {
    const userService = TestBed.inject(UserService);
    fixture.whenStable().then(() => {
      expect(component.currentUserId).toEqual(USER_ID);
      expect(userService.getCurrentUserInfo).toHaveBeenCalledTimes(1);
    });
  }));

  it('should get all target areas', waitForAsync(() => {
    const exerciseService = TestBed.inject(ExerciseService);
    fixture.whenStable().then(() => {
      expect(component.allTargetAreas).toBeTruthy();
      expect(exerciseService.getTargetAreas).toHaveBeenCalledTimes(1);
    });
  }));

  it('should get resistance types', waitForAsync(() => {
    const exerciseService = TestBed.inject(ExerciseService);
    fixture.whenStable().then(() => {
      expect(component.resistanceTypes).toBeTruthy();
      expect(exerciseService.getResistanceTypes).toHaveBeenCalledTimes(1);
    });
  }));

  //TODO: Complete
  xit('should save exercise', waitForAsync(() => {

    const exerciseService = TestBed.inject(ExerciseService);
    fixture.whenStable().then(() => {

      component.exerciseForm.setValue({
        id: 10,
        name: 'Standing Press w/Resistance Bands',
        description: 'something',
        resistanceTypes: '[1]',
        oneSided: [false],
        targetAreas: ['Chest', 'Triceps'],
        setup: 'Ready',
        movement: 'Set',
        pointsToRemember: 'Go'
      });

      const button = fixture.debugElement.query(By.css("button[type = 'submit']"));

    });

  }));

});
