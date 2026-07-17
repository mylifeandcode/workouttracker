import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { form, FieldTree } from '@angular/forms/signals';
import { IExercisePlanModel } from './interfaces/i-exercise-plan-form-group';

import { ExercisePlanComponent } from './exercise-plan.component';
import { ResistanceTypePipe } from '../../_pipes/resistance-type.pipe';
import { getExercisePlanModel } from './exercise-plan-model.mock';

describe('ExercisePlanComponent', () => {
  let component: ExercisePlanComponent;
  let fixture: ComponentFixture<ExercisePlanComponent>;
  let field: FieldTree<IExercisePlanModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExercisePlanComponent,
        ResistanceTypePipe //TODO: Replace with mock
      ],
      providers: [
        provideZonelessChangeDetection()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExercisePlanComponent);
    component = fixture.componentInstance;
    field = TestBed.runInInjectionContext(() => form(signal(getExercisePlanModel())));
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should re-emit the resistance-bands modal request', () => {
    //ARRANGE
    vi.spyOn(component.resistanceBandsModalRequested, 'emit');

    //ACT
    component.selectResistanceBands(field);

    //ASSERT
    expect(component.resistanceBandsModalRequested.emit).toHaveBeenCalledWith(field);
  });

});
