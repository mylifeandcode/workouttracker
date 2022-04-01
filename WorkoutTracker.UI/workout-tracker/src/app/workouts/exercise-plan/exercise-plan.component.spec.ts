import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ExercisePlanComponent } from './exercise-plan.component';

describe('ExercisePlanComponent', () => {
  let component: ExercisePlanComponent;
  let fixture: ComponentFixture<ExercisePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ], 
      declarations: [ ExercisePlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExercisePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply last resistance values when user chooses to', () => {

    //ARRANGE
    const formBuilder = new FormBuilder();
    component.formGroup = formBuilder.group({
      resistanceAmountLastTime: 50, 
      resistanceMakeupLastTime: 'Mauve, Tiel', 
      resistanceAmount: 0, 
      resistanceMakeup: ''
    });

    //ACT
    component.useSameResistanceAsLastTime();

    //ASSERT
    expect(component.formGroup.controls['resistanceAmount'].value).toBe(50);
    expect(component.formGroup.controls['resistanceMakeup'].value).toBe('Mauve, Tiel');

  });
});
