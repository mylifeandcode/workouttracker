import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutInfoComponent } from './workout-info.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('WorkoutInfoComponent', () => {
  let component: WorkoutInfoComponent;
  let fixture: ComponentFixture<WorkoutInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [WorkoutInfoComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
