import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseListComponent } from './exercise-list.component';
import { ExerciseService } from '../_services/exercise.service';
import { Exercise } from '../../workouts/_models/exercise';
import { of } from 'rxjs';
import { PaginatedResults } from '../../core/_models/paginated-results';
import { TargetArea } from '../../workouts/_models/target-area';
import { RouterLink, RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class ExerciseServiceMock {
    getAll = vi.fn().mockReturnValue(of(new PaginatedResults<Exercise>()));
    getTargetAreas = vi.fn().mockReturnValue(of(new Array<TargetArea>()));
}

describe('ExerciseListComponent', () => {
    let component: ExerciseListComponent;
    let fixture: ComponentFixture<ExerciseListComponent>;
    let exerciseService: ExerciseService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterModule.forRoot([]),
                ExerciseListComponent,
                NoopAnimationsModule
            ],
            providers: [
                {
                    provide: ExerciseService,
                    useClass: ExerciseServiceMock
                },
                provideZonelessChangeDetection()
            ]
        })
            .overrideComponent(ExerciseListComponent, {
            remove: {
                imports: [NzTableModule, RouterLink] //Some imports still required to test
            },
            add: {
                schemas: [CUSTOM_ELEMENTS_SCHEMA]
            }
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ExerciseListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        exerciseService = TestBed.inject(ExerciseService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get exercises lazily', () => {
        //ARRANGE
        const queryParams = <NzTableQueryParams>{
            pageIndex: 1,
            pageSize: 10
        };

        //ACT
        component.getExercisesLazy(queryParams);

        //ASSERT
        expect(exerciseService.getAll).toHaveBeenCalledWith(0, 10, '', null);
    });

    //TODO: Add tests for refactored filter methods
});
