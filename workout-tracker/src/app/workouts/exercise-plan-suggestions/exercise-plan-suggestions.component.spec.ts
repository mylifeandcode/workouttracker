import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePlanSuggestionsComponent } from './exercise-plan-suggestions.component';

describe('ExercisePlanSuggestionsComponent', () => {
  let component: ExercisePlanSuggestionsComponent;
  let fixture: ComponentFixture<ExercisePlanSuggestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExercisePlanSuggestionsComponent]
    });
    fixture = TestBed.createComponent(ExercisePlanSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
