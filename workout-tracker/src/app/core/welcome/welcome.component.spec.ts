import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserOverview } from 'app/core/models/user-overview';
import { UserService } from 'app/core/services/user/user.service';
import { of } from 'rxjs';

import { WelcomeComponent } from './welcome.component';
import { UserOverviewComponent } from '../user-overview/user-overview.component';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';

class UserServiceMock {
  getOverview =
    jasmine.createSpy('getOverview')
      .and.returnValue(
        of(<UserOverview>{
          lastWorkoutDateTime: new Date(2022, 2, 26, 15, 20),
          plannedWorkoutCount: 3,
          username: 'Tyson'
        }
        ));
}

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        {
          provide: UserService,
          useClass: UserServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .overrideComponent(
      WelcomeComponent,
      { 
        remove: { imports: [UserOverviewComponent, QuickActionsComponent] }, 
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      },
    )
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
