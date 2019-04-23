import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutEditComponent } from './workout-edit.component';

describe('WorkoutEditComponent', () => {
  let component: WorkoutEditComponent;
  let fixture: ComponentFixture<WorkoutEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutEditComponent ]
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
