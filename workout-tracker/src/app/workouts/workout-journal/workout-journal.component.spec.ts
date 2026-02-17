import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutJournalComponent } from './workout-journal.component';
import { of } from 'rxjs';
import { ExecutedWorkoutSummaryDTO } from '../../api';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';

class MockExecutedWorkoutService {
  getFilteredSubset = vi.fn().mockReturnValue(of(new PaginatedResults<ExecutedWorkoutSummaryDTO>()));
}

describe('WorkoutJournalComponent', () => {
  let component: WorkoutJournalComponent;
  let fixture: ComponentFixture<WorkoutJournalComponent>;
  let executedWorkoutService: ExecutedWorkoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutJournalComponent],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useClass: MockExecutedWorkoutService
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