import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExerciseListMiniComponent } from './exercise-list-mini.component';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ExerciseService } from '../exercise.service';
import { PaginatedResults } from '../../core/models/paginated-results';
import { of } from 'rxjs';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { TargetArea } from 'app/workouts/models/target-area';

class ExerciseServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new PaginatedResults<ExerciseDTO>()));
  getTargetAreas = jasmine.createSpy('getTargetAreas').and.returnValue(of(new Array<TargetArea>()));
}

describe('ExerciseListMiniComponent', () => {
  let component: ExerciseListMiniComponent;
  let fixture: ComponentFixture<ExerciseListMiniComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseListMiniComponent ],
      providers: [
        {
          provide: ExerciseService,
          useClass: ExerciseServiceMock
        }
      ],
      imports: [
        TableModule,
        MultiSelectModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
