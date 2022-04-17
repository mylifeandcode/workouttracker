import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutLogPastStartComponent } from './workout-log-past-start.component';

describe('WorkoutLogPastStartComponent', () => {
  let component: WorkoutLogPastStartComponent;
  let fixture: ComponentFixture<WorkoutLogPastStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutLogPastStartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutLogPastStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
