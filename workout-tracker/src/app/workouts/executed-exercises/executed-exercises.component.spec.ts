import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutedExercisesComponent } from './executed-exercises.component';

describe('ExecutedExercisesComponent', () => {
  let component: ExecutedExercisesComponent;
  let fixture: ComponentFixture<ExecutedExercisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExecutedExercisesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutedExercisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
