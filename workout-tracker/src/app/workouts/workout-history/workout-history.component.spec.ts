import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutHistoryComponent } from './workout-history.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { RouterLink, RouterModule } from '@angular/router';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { of } from 'rxjs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { SharedModule } from 'primeng/api';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DatePipe } from '@angular/common';

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
    .overrideComponent(
      WorkoutHistoryComponent,
      {
        remove: { imports: [NzTableModule, SharedModule, RouterLink, NzToolTipModule , DialogModule, DatePipe] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      }
    )
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
