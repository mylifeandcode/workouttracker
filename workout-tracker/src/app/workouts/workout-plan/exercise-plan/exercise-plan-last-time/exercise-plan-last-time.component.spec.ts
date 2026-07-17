import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, Pipe, PipeTransform } from '@angular/core';
import { form } from '@angular/forms/signals';

import { ExercisePlanLastTimeComponent } from './exercise-plan-last-time.component';
import { RatingPipe } from '../../../_pipes/rating.pipe';
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

describe('ExercisePlanLastTimeComponent', () => {
  let component: ExercisePlanLastTimeComponent;
  let fixture: ComponentFixture<ExercisePlanLastTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExercisePlanLastTimeComponent,
        RatingPipe, //TODO: Replace with mock
        MockResistanceAmountPipe],
      providers: [
        provideZonelessChangeDetection()
      ]
    });
    fixture = TestBed.createComponent(ExercisePlanLastTimeComponent);
    component = fixture.componentInstance;
    const field = TestBed.runInInjectionContext(() => form(signal(getExercisePlanModel())));
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
