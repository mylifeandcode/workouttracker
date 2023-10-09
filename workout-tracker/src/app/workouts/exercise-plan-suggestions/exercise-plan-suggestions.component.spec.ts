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
    //TODO: Set formGroup
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply suggestion values when user chooses to', () => {

    //ARRANGE
    component.formGroup.patchValue({
      resistanceAmountLastTime: 50, 
      resistanceMakeupLastTime: 'Mauve, Tiel', 
      resistanceAmount: 0, 
      resistanceMakeup: '', 
      recommendedResistanceAmount: 60, 
      recommendedResistanceMakeup: 'Aqua', 
      recommendedTargetRepCount: 8
    });

    //ACT
    component.useSuggestions();

    //ASSERT
    expect(component.formGroup.controls.resistanceAmount.value).toBe(60);
    expect(component.formGroup.controls.resistanceMakeup.value).toBe('Aqua');
    expect(component.formGroup.controls.recommendedTargetRepCount.value).toBe(8);

  });  

});
