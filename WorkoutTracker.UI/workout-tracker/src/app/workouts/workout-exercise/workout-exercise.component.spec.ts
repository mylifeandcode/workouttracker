import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkoutExerciseComponent } from './workout-exercise.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

describe('WorkoutExerciseComponent', () => {
  let component: WorkoutExerciseComponent;
  let fixture: ComponentFixture<WorkoutExerciseComponent>;
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ], 
      declarations: [ WorkoutExerciseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutExerciseComponent);
    component = fixture.componentInstance;
    formBuilder = new FormBuilder();
    component.formGroup = formBuilder.group({
      id: [0, Validators.required ],
      workoutDefinitions: [''], //https://coryrylan.com/blog/creating-a-dynamic-select-with-angular-forms
      exercises: formBuilder.array([])
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
