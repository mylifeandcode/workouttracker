import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutInfoComponent } from './workout-info.component';

describe('WorkoutInfoComponent', () => {
  let component: WorkoutInfoComponent;
  let fixture: ComponentFixture<WorkoutInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
