import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSelectPlannedComponent } from './workout-select-planned.component';

describe('WorkoutSelectPlannedComponent', () => {
  let component: WorkoutSelectPlannedComponent;
  let fixture: ComponentFixture<WorkoutSelectPlannedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutSelectPlannedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSelectPlannedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
