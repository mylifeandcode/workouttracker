import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePlanNextTimeComponent } from './exercise-plan-next-time.component';

describe('ExercisePlanNextTimeComponent', () => {
  let component: ExercisePlanNextTimeComponent;
  let fixture: ComponentFixture<ExercisePlanNextTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExercisePlanNextTimeComponent]
    });
    fixture = TestBed.createComponent(ExercisePlanNextTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
