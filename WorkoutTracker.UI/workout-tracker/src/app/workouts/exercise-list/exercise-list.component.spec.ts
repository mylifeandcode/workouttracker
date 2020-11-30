import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseListComponent } from './exercise-list.component';
import { TableModule } from 'primeng/table';
import { RouterTestingModule } from '@angular/router/testing';
import { ExerciseService } from '../exercise.service';
import { Exercise } from 'app/workouts/models/exercise';
import { of } from 'rxjs';
import { PaginatedResults } from '../../core/models/paginated-results';
import { MultiSelectModule } from 'primeng/multiselect';
import { TargetArea } from 'app/workouts/models/target-area';

class ExerciseServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new PaginatedResults<Exercise>()));
  getTargetAreas = jasmine.createSpy('getTargetAreas').and.returnValue(of(new Array<TargetArea>()));
}

describe('ExerciseListComponent', () => {
  let component: ExerciseListComponent;
  let fixture: ComponentFixture<ExerciseListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseListComponent ], 
      imports: [ 
        TableModule, 
        RouterTestingModule, 
        MultiSelectModule 
      ], 
      providers: [ 
        {
          provide: ExerciseService, 
          useClass: ExerciseServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
