import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TableModule } from 'primeng/table';

import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../workout.service';
import { of } from 'rxjs';
import { PaginatedResults } from '../../core/models/paginated-results';
import { WorkoutDTO } from 'app/workouts/models/workout-dto';
import { User } from 'app/core/models/user';
import { TableComponentMock } from 'app/testing/component-mocks/primeNg/p-table-mock';


class WorkoutServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new PaginatedResults<WorkoutDTO>()));
}

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        WorkoutListComponent, 
        TableComponentMock 
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
