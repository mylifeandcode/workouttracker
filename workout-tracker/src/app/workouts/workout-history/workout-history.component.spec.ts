import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutHistoryComponent } from './workout-history.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ExecutedWorkoutService } from '../executed-workout.service';
import { RouterModule } from '@angular/router';
import { PaginatedResults } from 'app/core/models/paginated-results';
import { ExecutedWorkoutSummaryDTO } from '../models/executed-workout-summary-dto';
import { of } from 'rxjs';

class MockExecutedWorkoutService {
  getFilteredSubset =
    jasmine.createSpy('getFilteredSubset')
      .and.returnValue(of(new PaginatedResults<ExecutedWorkoutSummaryDTO>()));
}

describe('WorkoutHistoryComponent', () => {
  let component: WorkoutHistoryComponent;
  let fixture: ComponentFixture<WorkoutHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [WorkoutHistoryComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: ExecutedWorkoutService,
          useClass: MockExecutedWorkoutService
        }
      ]
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
});
