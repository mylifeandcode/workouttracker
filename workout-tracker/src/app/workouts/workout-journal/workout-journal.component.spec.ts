import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutJournalComponent } from './workout-journal.component';
import { of } from 'rxjs';
import { ExecutedWorkoutSummaryDTOPaginatedResults } from '../../api';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { type Mocked } from 'vitest';

describe('WorkoutJournalComponent', () => {
  let component: WorkoutJournalComponent;
  let fixture: ComponentFixture<WorkoutJournalComponent>;
  let executedWorkoutService: ExecutedWorkoutService;

  beforeEach(async () => {
    const MockExecutedWorkoutService: Partial<Mocked<ExecutedWorkoutService>> = {
      getFilteredSubset: vi.fn().mockReturnValue(of(<ExecutedWorkoutSummaryDTOPaginatedResults>{}))
    };

    await TestBed.configureTestingModule({
      imports: [WorkoutJournalComponent],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useValue: MockExecutedWorkoutService
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutJournalComponent);
    component = fixture.componentInstance;
    executedWorkoutService = TestBed.inject(ExecutedWorkoutService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get workouts on init', () => {
    expect(executedWorkoutService.getFilteredSubset).toHaveBeenCalledWith(0, 10, null, true);
  });

});