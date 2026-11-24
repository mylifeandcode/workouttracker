import { Component, CUSTOM_ELEMENTS_SCHEMA, input, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../../../api';
import { WorkoutDetailDTO } from '../../../api';
import { WorkoutService } from '../../_services/workout.service';

import { RecentWorkoutsComponent } from './recent-workouts.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { WorkoutInfoComponent } from './workout-info/workout-info.component';
import { DatePipe } from '@angular/common';
import { type Mocked } from 'vitest';

@Component({
  selector: 'wt-workout-info',
  template: ''
})
class MockWorkoutInfoComponent {
  readonly workout = input<WorkoutDetailDTO>();
}

describe('RecentWorkoutsComponent', () => {
  let component: RecentWorkoutsComponent;
  let fixture: ComponentFixture<RecentWorkoutsComponent>;

  const executedWorkoutServiceMock: Mocked<Pick<ExecutedWorkoutService, 'getRecent'>> = {
    getRecent: vi.fn<ExecutedWorkoutService['getRecent']>(() => of(new Array<ExecutedWorkoutSummaryDTO>())).mockName('getRecent')
  };
  const workoutServiceMock: Mocked<Pick<WorkoutService, never>> = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: ExecutedWorkoutService,
          useValue: executedWorkoutServiceMock
        },
        {
          provide: WorkoutService,
          useValue: workoutServiceMock
        }
      ],
      imports: [
        RecentWorkoutsComponent,
        MockWorkoutInfoComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(RecentWorkoutsComponent, {
        remove: { imports: [NzTableModule, NzModalModule, WorkoutInfoComponent, DatePipe] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentWorkoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
