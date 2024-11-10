import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { PaginatedResults } from 'app/core/_models/paginated-results';
import { of } from 'rxjs';
import { WorkoutDTO } from '../_models/workout-dto';
import { WorkoutService } from '../_services/workout.service';

import { WorkoutSelectComponent } from './workout-select.component';
import { RouterModule } from '@angular/router';
import { RecentWorkoutsComponent } from './recent-workouts/recent-workouts.component';

class WorkoutServiceMock {
  getFilteredSubset = jasmine.createSpy('getFilteredSubset').and.callFake(() => {
    const fakeResponse = new PaginatedResults<WorkoutDTO>();
    fakeResponse.results = [];
    fakeResponse.results.push(new WorkoutDTO());
    fakeResponse.results[0].name = "Workout 1";
    fakeResponse.results.push(new WorkoutDTO());
    fakeResponse.results[1].name = "Workout 2";
    fakeResponse.totalCount = 2;
    return of(fakeResponse);
  });
}

describe('WorkoutSelectComponent', () => {
  let component: WorkoutSelectComponent;
  let fixture: ComponentFixture<WorkoutSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: WorkoutService,
          useClass: WorkoutServiceMock
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj("AuthService", {}, { currentUserName: of("someUser") })
        }
      ],
      imports: [
        RouterModule.forRoot([]),
        WorkoutSelectComponent
      ]
    })
      .overrideComponent(
        WorkoutSelectComponent,
        { 
          remove: { imports: [RecentWorkoutsComponent] },
          add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        }
      )
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
