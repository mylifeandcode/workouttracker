import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ExecutedExercisesComponent } from './executed-exercises.component';

describe('ExecutedExercisesComponent', () => {
  let component: ExecutedExercisesComponent;
  let fixture: ComponentFixture<ExecutedExercisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
  imports: [ExecutedExercisesComponent],
  providers: [provideZonelessChangeDetection()]
})
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
