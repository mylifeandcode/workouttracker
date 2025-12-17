import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutHistoryComponent } from './workout-history.component';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ExecutedWorkoutService } from '../_services/executed-workout.service';
import { RouterLink, RouterModule } from '@angular/router';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { ExecutedWorkoutSummaryDTO } from '../_models/executed-workout-summary-dto';
import { of } from 'rxjs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DatePipe } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';

class MockExecutedWorkoutService {
    getFilteredSubset = vi.fn().mockReturnValue(of(new PaginatedResults<ExecutedWorkoutSummaryDTO>()));
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
                },
                provideZonelessChangeDetection()
            ]
        })
            .overrideComponent(WorkoutHistoryComponent, {
            remove: { imports: [NzTableModule, RouterLink, NzToolTipModule, NzModalModule, DatePipe] },
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
        expect(component.loading()).toBe(false); // Should be false after ngOnInit completes
        expect(component.totalRecords()).toBe(0);
        expect(component.executedWorkouts()).toEqual([]);
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
