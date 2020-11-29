import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { TargetArea } from 'app/models/target-area';
import { Exercise } from 'app/models/exercise';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';


class ExerciseServiceMock {
  resistanceTypes: Map<number, string> = null;

  constructor() {
    this.resistanceTypes = new Map<number, string>();
    this.resistanceTypes.set(0, 'Free Weight');
    this.resistanceTypes.set(1, 'Resistance Band');
  }

  getTargetAreas = jasmine.createSpy('getTargetAreas').and.returnValue(of(new Array<TargetArea>()));
  getById = jasmine.createSpy('getById').and.returnValue(of(new Exercise()));
  getResistanceTypes = 
    jasmine.createSpy('getResistanceTypes')
      .and.returnValue(of(this.resistanceTypes));
}

class UserServiceMock {
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User()));
}

describe('ExerciseEditComponent', () => {
  let component: ExerciseEditComponent;
  let fixture: ComponentFixture<ExerciseEditComponent>;

  beforeEach(async(() => {
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

  it('should get exercise when id is not 0', async(() => {
    const exerciseService: ExerciseService = TestBed.get(ExerciseService);
    fixture.whenStable().then(() => {
      expect(exerciseService.getById).toHaveBeenCalled();
      expect(component.currentUserId).not.toBeNull();
    });
  }));
});
