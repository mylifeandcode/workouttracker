import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutJournalComponent } from './workout-journal.component';
import { of } from 'rxjs';
import { PaginatedResultsOfExecutedWorkoutSummaryDTO } from '../../api';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { type Mocked } from 'vitest';

describe('WorkoutJournalComponent', () => {
  let component: WorkoutJournalComponent;
  let fixture: ComponentFixture<WorkoutJournalComponent>;

  const executedWorkoutServiceMock: Mocked<Pick<ExecutedWorkoutService, 'getFilteredSubset'>> = {
    getFilteredSubset: vi.fn<ExecutedWorkoutService['getFilteredSubset']>(() => of(<PaginatedResultsOfExecutedWorkoutSummaryDTO>{})).mockName('getFilteredSubset')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutJournalComponent],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useValue: executedWorkoutServiceMock
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutJournalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get workouts on init', () => {
    expect(executedWorkoutServiceMock.getFilteredSubset).toHaveBeenCalledWith(0, 10, null, true);
  });

});