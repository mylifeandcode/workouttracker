import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSelectComponent } from './workout-select.component';

//TODO: This component is currently deprecated. Remove if we don't refactor to use it again.
xdescribe('WorkoutSelectComponent', () => {
  let component: WorkoutSelectComponent;
  let fixture: ComponentFixture<WorkoutSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
