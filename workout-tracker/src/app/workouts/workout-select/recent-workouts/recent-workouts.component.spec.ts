import { Component, CUSTOM_ELEMENTS_SCHEMA, input, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../../_services/executed-workout.service';
import { ExecutedWorkoutSummaryDTO } from '../../_models/executed-workout-summary-dto';
import { Workout } from '../../_models/workout';
import { WorkoutService } from '../../_services/workout.service';

import { RecentWorkoutsComponent } from './recent-workouts.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';

class MockExecutedWorkoutService {
  getRecent = jasmine.createSpy('getRecent ').and.returnValue(of(new Array<ExecutedWorkoutSummaryDTO>()));
}

class MockWorkoutService { }
class MockRouter { }

@Component({
  selector: 'wt-workout-info',
  template: ''
})
class MockWorkoutInfoComponent {
  readonly workout = input<Workout>();
}

describe('RecentWorkoutsComponent', () => {
  let component: RecentWorkoutsComponent;
  let fixture: ComponentFixture<RecentWorkoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
  provideZonelessChangeDetection(),
        {
          provide: ExecutedWorkoutService,
          useClass: MockExecutedWorkoutService
        },
        {
          provide: WorkoutService,
          useClass: MockWorkoutService
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ],
      imports: [
        RecentWorkoutsComponent,
        MockWorkoutInfoComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(
        RecentWorkoutsComponent,
        {
          remove: { imports: [NzTableModule, NzModalModule] },
          add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        }
      )
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentWorkoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
