import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { of } from 'rxjs';
import { WorkoutDTO } from '../_models/workout-dto';
import { WorkoutService } from '../_services/workout.service';
import { WorkoutLogPastStartComponent } from './workout-log-past-start.component';

class WorkoutServiceMock {
    getFilteredSubset = vi.fn().mockReturnValue(of(this.getWorkouts()));

    private getWorkouts(): PaginatedResults<WorkoutDTO> {
        const result = new PaginatedResults<WorkoutDTO>();

        result.totalCount = 3;
        result.results = [];

        for (let x = 0; x < 3; x++) {
            result.results.push(new WorkoutDTO());
            result.results[x].id = x.toString();
            result.results[x].name = `Workout ${x}`;
        }

        return result;
    }
}

class RouterMock {
    navigate = vi.fn().mockReturnValue(Promise.resolve(true));
}

describe('WorkoutLogPastStartComponent', () => {
    let component: WorkoutLogPastStartComponent;
    let fixture: ComponentFixture<WorkoutLogPastStartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                {
                    provide: WorkoutService,
                    useClass: WorkoutServiceMock
                },
                {
                    provide: Router,
                    useClass: RouterMock
                },
                // TODO: What is proper etiquette for components using a FormBuilder?
                // Should we mock it like other dependencies?
                FormBuilder,
                provideZonelessChangeDetection()
            ],
            imports: [
                ReactiveFormsModule,
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

    it('should proceed to the next step via proceedToWorkoutEntry()', () => {

        //ARRANGE
        const router = TestBed.inject(Router);
        component.formGroup.patchValue({
            workoutPublicId: 'some-guid-1',
            startDateTime: '2022-03-04T12:00',
            endDateTime: '2022-03-04T12:30'
        });

        //ACT
        component.proceedToWorkoutEntry();

        //ASSERT
        expect(router.navigate)
            //.toHaveBeenCalledWith(['/workouts/plan-for-past/some-guid-1/2022-04-04T16:00/2022-04-04T16:30']);
            .toHaveBeenCalledWith(['/workouts/plan-for-past/some-guid-1/2022-03-04T12:00/2022-03-04T12:30']);

    });

    it('should set endDateTime via duration', () => {
        //ARRANGE
        component.formGroup.patchValue({
            workoutPublicId: 'some-guid-1',
            startDateTime: '2022-03-04T12:00'
        });

        //ACT
        component.durationModalAccepted(3600);

        //ASSERT
        expect(component.formGroup.controls.endDateTime.value).toEqual('2022-03-04T13:00');
    });

});
