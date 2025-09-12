import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';

import { ExecutedExercisesComponent } from './executed-exercises.component';
import { ExerciseSidePipe } from 'app/workouts/_pipes/exercise-side.pipe';
import { NgStyle } from '@angular/common';
import { ResistanceBandColorPipe } from 'app/shared/pipes/resistance-band-color.pipe';
import { RatingPipe } from 'app/workouts/_pipes/rating.pipe';
import { ResistanceTypePipe } from 'app/workouts/_pipes/resistance-type.pipe';
import { DurationPipe } from 'app/workouts/_pipes/duration.pipe';
import { ResistanceAmountPipe } from 'app/workouts/_pipes/resistance-amount.pipe';

describe('ExecutedExercisesComponent', () => {
  let component: ExecutedExercisesComponent;
  let fixture: ComponentFixture<ExecutedExercisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutedExercisesComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .overrideComponent(
      ExecutedExercisesComponent, 
      {
        remove: {
          imports: [
            NgStyle, ResistanceBandColorPipe, RatingPipe, ResistanceTypePipe, DurationPipe, 
            ExerciseSidePipe, ResistanceAmountPipe
          ]
        },
        add: {
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }
      }
    )
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
