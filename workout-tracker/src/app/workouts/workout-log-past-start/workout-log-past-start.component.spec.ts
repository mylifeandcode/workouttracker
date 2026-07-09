import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { WorkoutDTO, PaginatedResultsOfWorkoutDTO } from '../../api';
import { WorkoutService } from '../_services/workout.service';
import { WorkoutLogPastStartComponent } from './workout-log-past-start.component';
import { type Mocked } from 'vitest';

function getLogPastStartWorkouts(): PaginatedResultsOfWorkoutDTO {
  const result = <PaginatedResultsOfWorkoutDTO>{};

  result.totalCount = 3;
  result.results = [];

  for (let x = 0; x < 3; x++) {
    result.results.push(<WorkoutDTO>{});
    result.results[x].id = x.toString();
    result.results[x].name = `Workout ${x}`;
  }

  return result;
}

describe('WorkoutLogPastStartComponent', () => {
  let component: WorkoutLogPastStartComponent;
  let fixture: ComponentFixture<WorkoutLogPastStartComponent>;

  beforeEach(async () => {
    const WorkoutServiceMock: Partial<Mocked<WorkoutService>> = {
      getFilteredSubset: vi.fn<WorkoutService['getFilteredSubset']>().mockReturnValue(of(getLogPastStartWorkouts()))
    };
    const RouterMock: Partial<Mocked<Router>> = {
      navigate: vi.fn<Router['navigate']>().mockReturnValue(Promise.resolve(true))
    };

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: WorkoutService,
          useValue: WorkoutServiceMock
        },
        {
          provide: Router,
          useValue: RouterMock
        },
        provideZonelessChangeDetection()
      ],
      imports: [
        WorkoutLogPastStartComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents(); //TODO: Use overrideComponent() to remove unneeded imports
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutLogPastStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get workouts on init', () => {
    const service = TestBed.inject(WorkoutService);
    expect(service.getFilteredSubset).toHaveBeenCalledWith(0, 500, true);
    expect(component.workouts).not.toBeNull();
    expect(component.workouts().length).toBe(3);
  });

  it('should proceed to the next step via proceedToWorkoutEntry()', async () => {

    //ARRANGE
    const router = TestBed.inject(Router);
    component.formGroup.workoutPublicId().value.set('some-guid-1');
    component.formGroup.startDateTime().value.set('2022-03-04T12:00');
    component.formGroup.endDateTime().value.set('2022-03-04T12:30');

    //ACT
    component.proceedToWorkoutEntry();
    await fixture.whenStable(); //submit() runs its action asynchronously

    //ASSERT
    expect(router.navigate)
      .toHaveBeenCalledWith(['/workouts/plan-for-past/some-guid-1/2022-03-04T12:00/2022-03-04T12:30']);

  });

  it('should set endDateTime via duration', () => {
    //ARRANGE
    component.formGroup.workoutPublicId().value.set('some-guid-1');
    component.formGroup.startDateTime().value.set('2022-03-04T12:00');

    //ACT
    component.durationModalAccepted(3600);

    //ASSERT
    expect(component.formGroup.endDateTime().value()).toEqual('2022-03-04T13:00');
  });

  it('should flag a compareDates error when start is after end', () => {
    //ARRANGE
    component.formGroup.startDateTime().value.set('2022-03-04T13:00');
    component.formGroup.endDateTime().value.set('2022-03-04T12:00');

    //ASSERT
    expect(component.formGroup().errors().some(e => e.kind === 'compareDates')).toBe(true);
  });

});
