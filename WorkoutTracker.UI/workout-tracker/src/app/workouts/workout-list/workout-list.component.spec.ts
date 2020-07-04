import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TableModule } from 'primeng/table';

import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../workout.service';
import { Observable, of } from 'rxjs';
import { PaginatedResults } from 'app/models/paginated-results';
import { WorkoutDTO } from 'app/models/workout-dto';


class WorkoutServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new Observable<PaginatedResults<WorkoutDTO>>()));
}

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutListComponent ], 
      imports: [
        TableModule, 
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
