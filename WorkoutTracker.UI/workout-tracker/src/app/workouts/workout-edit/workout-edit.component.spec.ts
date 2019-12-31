import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutEditComponent } from './workout-edit.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';

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


describe('WorkoutEditComponent', () => {
  let component: WorkoutEditComponent;
  let fixture: ComponentFixture<WorkoutEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        WorkoutEditComponent, 
        FakeExerciseListMiniComponent, 
        FakeWorkoutSetDefComponent
      ], 
      imports: [
        ReactiveFormsModule, 
        ProgressSpinnerModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
