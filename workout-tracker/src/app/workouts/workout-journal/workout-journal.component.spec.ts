import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutJournalComponent } from './workout-journal.component';

describe('WorkoutJournalComponent', () => {
  let component: WorkoutJournalComponent;
  let fixture: ComponentFixture<WorkoutJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutJournalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutJournalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
