import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WorkoutDTO, PaginatedResultsOfWorkoutDTO } from '../../api';
import { WorkoutService } from '../_services/workout.service';

import { WorkoutSelectComponent } from './workout-select.component';
import { provideRouter } from '@angular/router';
import { RecentWorkoutsComponent } from './recent-workouts/recent-workouts.component';
import { type Mocked } from 'vitest';

describe('WorkoutSelectComponent', () => {
  let component: WorkoutSelectComponent;
  let fixture: ComponentFixture<WorkoutSelectComponent>;

  const workoutServiceMock: Mocked<Pick<WorkoutService, 'getFilteredSubset'>> = {
    getFilteredSubset: vi.fn<WorkoutService['getFilteredSubset']>(() => {
      const fakeResponse = <PaginatedResultsOfWorkoutDTO>{};
      fakeResponse.results = [];
      fakeResponse.results.push(<WorkoutDTO>{});
      fakeResponse.results[0].name = "Workout 1";
      fakeResponse.results[0].id = "1";
      fakeResponse.results.push(<WorkoutDTO>{});
      fakeResponse.results[1].name = "Workout 2";
      fakeResponse.results[1].id = "2";
      fakeResponse.totalCount = 2;
      return of(fakeResponse);
    }).mockName('getFilteredSubset')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: WorkoutService,
          useValue: workoutServiceMock
        }
      ],
      imports: [
        WorkoutSelectComponent
      ]
    })
      .overrideComponent(WorkoutSelectComponent, {
        remove: { imports: [RecentWorkoutsComponent] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSelectComponent);
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
