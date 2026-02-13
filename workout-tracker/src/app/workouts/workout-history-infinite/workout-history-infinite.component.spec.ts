import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutHistoryInfiniteComponent } from './workout-history-infinite.component';

describe('WorkoutHistoryInfiniteComponent', () => {
  let component: WorkoutHistoryInfiniteComponent;
  let fixture: ComponentFixture<WorkoutHistoryInfiniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutHistoryInfiniteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutHistoryInfiniteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
