import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserOverview } from 'app/core/models/user-overview';
import { UserOverviewComponent } from './user-overview.component';

describe('UserOverviewComponent', () => {
  let component: UserOverviewComponent;
  let fixture: ComponentFixture<UserOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserOverviewComponent);
    component = fixture.componentInstance;
    component.userOverview = getUserOverview();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //Setup Methods
  function getUserOverview(): UserOverview {
    const userOverview = new UserOverview();

    userOverview.lastWorkoutDateTime = new Date(2022, 2, 26, 13, 15, 0, 0);
    userOverview.plannedWorkoutCount = 2;
    userOverview.username = "Dave";

    return userOverview;
  }
  //
});
