import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutHistoryComponent } from './workout-history.component';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { RouterLink, RouterModule } from '@angular/router';
import { ExecutedWorkoutSummaryDTOPaginatedResults } from '../../api';
import { of } from 'rxjs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { DatePipe } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { type Mocked } from 'vitest';

describe('WorkoutHistoryComponent', () => {
  let component: WorkoutHistoryComponent;
  let fixture: ComponentFixture<WorkoutHistoryComponent>;

  beforeEach(async () => {
    const MockExecutedWorkoutService: Partial<Mocked<ExecutedWorkoutService>> = {
      getFilteredSubset: vi.fn().mockReturnValue(of(<ExecutedWorkoutSummaryDTOPaginatedResults>{ totalCount: 0, results: [] }))
    };

    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [WorkoutHistoryComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useValue: MockExecutedWorkoutService
        },
        provideZonelessChangeDetection()
      ]
    })
      .overrideComponent(WorkoutHistoryComponent, {
        remove: { imports: [NzTableModule, RouterLink, NzTooltipModule, NzModalModule, DatePipe] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    //TODO: Refactor test to include non-zero/non-empty mock results and verify those are set correctly.
    expect(component).toBeTruthy();
    expect(component.loading()).toBe(false); // Should be false after ngOnInit completes
    expect(component.totalRecords()).toEqual(0); //Mock results have 0
    expect(component.executedWorkouts()).toEqual([]); //Mock resutls are empty array
  });

  it('should open and close notes modal', () => {
    const testNotes = 'Test workout notes';

    component.openNotesModal(testNotes);
    expect(component.showNotesModal()).toBe(true);
    expect(component.notes()).toBe(testNotes);

    component.closeNotesModal();
    expect(component.showNotesModal()).toBe(false);
  });

  it('should reset filter', () => {
    component.workoutNameFilter.set('test filter');

    component.reset();

    expect(component.workoutNameFilter()).toBe('');
  });
});
