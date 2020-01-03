import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

import { ExerciseEditComponent } from './exercise-edit.component';
import { ExerciseService } from '../exercise.service';
import { UserService } from 'app/users/user.service';
import { User } from 'app/models/user';
import { TargetArea } from 'app/models/target-area';
import { Exercise } from 'app/models/exercise';


class ExerciseServiceMock {
  getTargetAreas = jasmine.createSpy('getTargetAreas').and.returnValue(of(new Array<TargetArea>()));
  getById = jasmine.createSpy('getById').and.returnValue(of(new Exercise()));
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
});
