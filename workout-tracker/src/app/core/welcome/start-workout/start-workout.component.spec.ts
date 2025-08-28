import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartWorkoutComponent } from './start-workout.component';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('StartWorkoutComponent', () => {
  let component: StartWorkoutComponent;
  let fixture: ComponentFixture<StartWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartWorkoutComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StartWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
