import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePlanLastTimeComponent } from './exercise-plan-last-time.component';
import { RatingPipe } from '../pipes/rating.pipe';

describe('ExercisePlanLastTimeComponent', () => {
  let component: ExercisePlanLastTimeComponent;
  let fixture: ComponentFixture<ExercisePlanLastTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExercisePlanLastTimeComponent, RatingPipe]
    });
    fixture = TestBed.createComponent(ExercisePlanLastTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
