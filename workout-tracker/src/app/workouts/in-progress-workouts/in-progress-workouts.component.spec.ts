import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { ExecutedWorkoutDTO } from '../_models/executed-workout-dto';

import { InProgressWorkoutsComponent } from './in-progress-workouts.component';
import { provideRouter } from '@angular/router';

class MockExeceutedWorkoutService {
    getInProgress = vi.fn().mockImplementation(() => {
        const workouts: ExecutedWorkoutDTO[] = [];
        workouts.push(...[<ExecutedWorkoutDTO>{
                id: 'guid-56',
                name: 'Chest and Arms',
                workoutId: 'some-guid-56',
                startDateTime: new Date(2023, 2, 18, 12, 13, 14), endDateTime: null,
                journal: null, rating: 0, exercises: [],
                createdByUserId: 1, createdDateTime: new Date(2023, 3, 18, 12, 0, 0),
                modifiedByUserId: 1, modifiedDateTime: new Date(2023, 3, 18, 12, 5, 0)
            },
            <ExecutedWorkoutDTO>{
                id: 'guid-56',
                name: 'Chest and Arms',
                workoutId: 'some-guid-56',
                startDateTime: new Date(2023, 2, 18, 12, 13, 14), endDateTime: null,
                journal: null, rating: 0, exercises: [],
                createdByUserId: 1, createdDateTime: new Date(2023, 3, 18, 12, 0, 0),
                modifiedByUserId: 1, modifiedDateTime: new Date(2023, 3, 18, 12, 5, 0)
            }]);

        return of(workouts);
    });
}

describe('InProgressWorkoutsComponent', () => {
    let component: InProgressWorkoutsComponent;
    let fixture: ComponentFixture<InProgressWorkoutsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InProgressWorkoutsComponent],
            providers: [
                {
                    provide: ExecutedWorkoutService,
                    useClass: MockExeceutedWorkoutService
                },
                provideRouter([]),
                provideZonelessChangeDetection()
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(InProgressWorkoutsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get in-progress workouts on init', () => {
        //ARRANGE
        const service = TestBed.inject(ExecutedWorkoutService);

        //ACT

        //ASSERT
        expect(service.getInProgress).toHaveBeenCalledTimes(1);
        expect(component.inProgressWorkouts().length).toBe(2);
        expect(component.loading()).toBe(false);
        expect(component.errorMessage()).toBeNull();
    });
});
