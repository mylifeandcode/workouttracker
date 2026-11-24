import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserOverview } from '../../api';
import { UserService } from '../../core/_services/user/user.service';
import { of } from 'rxjs';
import { type Mocked } from 'vitest';

import { WelcomeComponent } from './welcome.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { StartWorkoutComponent } from './start-workout/start-workout.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  const userServiceMock: Mocked<Pick<UserService, 'getOverview'>> = {
    getOverview: vi.fn<UserService['getOverview']>(() => of(<UserOverview>{
      lastWorkoutDateTime: new Date(2022, 2, 26, 15, 20),
      plannedWorkoutCount: 3,
      username: 'Tyson'
    })).mockName('getOverview')
  };

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: UserService,
          useValue: userServiceMock
        }
      ]
    })
      .overrideComponent(WelcomeComponent, {
        remove: { imports: [UserOverviewComponent, QuickActionsComponent, StartWorkoutComponent, NzSpinModule] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user overview on init', () => {

    expect(userServiceMock.getOverview).toHaveBeenCalled();
    expect(component.userOverview()).toEqual({
      lastWorkoutDateTime: new Date(2022, 2, 26, 15, 20),
      plannedWorkoutCount: 3,
      username: 'Tyson'
    });
    expect(component.loading()).toBe(false);
  });

});
