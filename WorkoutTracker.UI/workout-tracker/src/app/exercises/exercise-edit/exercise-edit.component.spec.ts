import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseEditComponent } from './exercise-edit.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ExerciseService } from '../exercise.service';
import { UserService } from 'app/users/user.service';
import { TableModule } from 'primeng/table';

class ExerciseServiceMock {

}

class UserServiceMock {

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
