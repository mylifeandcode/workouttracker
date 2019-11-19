import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutEditComponent } from './workout-edit.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReactiveFormsModule } from '@angular/forms';

describe('WorkoutEditComponent', () => {
  let component: WorkoutEditComponent;
  let fixture: ComponentFixture<WorkoutEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutEditComponent ], 
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
