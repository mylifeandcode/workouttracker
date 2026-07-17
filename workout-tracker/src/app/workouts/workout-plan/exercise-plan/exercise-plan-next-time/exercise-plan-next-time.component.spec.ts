import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, Pipe, PipeTransform } from '@angular/core';
import { form, FieldTree } from '@angular/forms/signals';

import { ExercisePlanNextTimeComponent } from './exercise-plan-next-time.component';
import { IExercisePlanModel } from '../interfaces/i-exercise-plan-form-group';
import { getExercisePlanModel } from '../exercise-plan-model.mock';

@Pipe({
  name: 'resistanceAmount',
  standalone: true
})
export class MockResistanceAmountPipe implements PipeTransform {
  transform(): string {
    return 'Fake Resistance Amount';
  }
}

describe('ExercisePlanNextTimeComponent', () => {
  let component: ExercisePlanNextTimeComponent;
  let fixture: ComponentFixture<ExercisePlanNextTimeComponent>;
  let field: FieldTree<IExercisePlanModel>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ExercisePlanNextTimeComponent,
        MockResistanceAmountPipe
      ],
      providers: [
        provideZonelessChangeDetection()
      ]
    });
    fixture = TestBed.createComponent(ExercisePlanNextTimeComponent);
    component = fixture.componentInstance;

    field = TestBed.runInInjectionContext(() => form(signal(getExercisePlanModel({
      resistanceAmount: 0,
      resistanceMakeup: '',
      resistanceAmountLastTime: 50,
      resistanceMakeupLastTime: 'Mauve, Tiel'
    }))));
    fixture.componentRef.setInput('field', field);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply last resistance values when user chooses to', () => {
    //ACT
    component.useSameResistanceAsLastTime();

    //ASSERT
    expect(field.resistanceAmount().value()).toBe(50);
    expect(field.resistanceMakeup().value()).toBe('Mauve, Tiel');
  });

  it('should emit the resistance-bands modal request with its field', () => {
    //ARRANGE
    vi.spyOn(component.resistanceBandsModalRequested, 'emit');

    //ACT
    component.selectResistanceBands();

    //ASSERT
    expect(component.resistanceBandsModalRequested.emit).toHaveBeenCalledWith(field);
  });

});
