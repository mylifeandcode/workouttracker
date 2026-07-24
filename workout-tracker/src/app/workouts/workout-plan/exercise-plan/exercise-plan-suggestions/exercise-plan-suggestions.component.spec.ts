import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, Pipe, PipeTransform } from '@angular/core';
import { form, FieldTree } from '@angular/forms/signals';

import { ExercisePlanSuggestionsComponent } from './exercise-plan-suggestions.component';
import { IExercisePlanModel } from '../interfaces/i-exercise-plan-form-group';
import { getExercisePlanModel } from '../exercise-plan-model.mock';

@Pipe({
    name: 'resistanceAmount',
})
export class MockResistanceAmountPipe implements PipeTransform {
  transform(): string {
    return 'Fake Resistance Amount';
  }
}

describe('ExercisePlanSuggestionsComponent', () => {
  let component: ExercisePlanSuggestionsComponent;
  let fixture: ComponentFixture<ExercisePlanSuggestionsComponent>;
  let field: FieldTree<IExercisePlanModel>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExercisePlanSuggestionsComponent,
        MockResistanceAmountPipe],
      providers: [
        provideZonelessChangeDetection()
      ]
    });
    fixture = TestBed.createComponent(ExercisePlanSuggestionsComponent);
    component = fixture.componentInstance;

    field = TestBed.runInInjectionContext(() => form(signal(getExercisePlanModel({
      resistanceAmount: 0,
      resistanceMakeup: '',
      recommendedResistanceAmount: 60,
      recommendedResistanceMakeup: 'Aqua',
      recommendedTargetRepCount: 8
    }))));
    fixture.componentRef.setInput('field', field);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply suggestion values when user chooses to', () => {
    //ACT
    component.useSuggestions();

    //ASSERT
    expect(field.resistanceAmount().value()).toBe(60);
    expect(field.resistanceMakeup().value()).toBe('Aqua');
    expect(field.targetRepCount().value()).toBe(8);
  });

});
