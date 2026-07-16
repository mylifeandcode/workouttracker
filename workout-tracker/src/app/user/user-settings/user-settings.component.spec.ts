import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/_services/auth/auth.service';
import { User, UserMinMaxReps, UserSettings, SetType } from '../../api';
import { UserService } from '../../core/_services/user/user.service';
import { of } from 'rxjs';
import { type Mocked } from 'vitest';

import { UserSettingsComponent } from './user-settings.component';
import { RouterLink, RouterModule } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserRepSettingsComponent } from './user-rep-settings/user-rep-settings.component';

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;

  beforeEach(async () => {
    const AuthServiceMock: Partial<Mocked<AuthService>> = {
      userId: 0,
      userPublicId: 'some-guid'
    };

    const UserServiceMock: Partial<Mocked<UserService>> = {
      getById: vi.fn<UserService['getById']>().mockImplementation(() => {
        const user = <User>{};
        user.settings = <UserSettings>{};
        user.settings.repSettings = new Array<UserMinMaxReps>();
        user.settings.repSettings.push(<UserMinMaxReps>{});
        user.settings.repSettings.push(<UserMinMaxReps>{});
        user.settings.repSettings[0].setType = SetType.REPETITION;
        user.settings.repSettings[0].id = 1;
        user.settings.repSettings[1].setType = SetType.TIMED;
        user.settings.repSettings[1].id = 2;
        user.settings.recommendationsEnabled = true;

        return of(user);
      }),
      update: vi.fn<UserService['update']>().mockImplementation((user: User) => of(user))
    };

    const MessageServiceMock: Partial<Mocked<NzMessageService>> = {
      success: vi.fn<NzMessageService['success']>()
    };

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: AuthServiceMock
        },
        {
          provide: UserService,
          useValue: UserServiceMock
        },
        {
          provide: NzMessageService,
          useValue: MessageServiceMock
        },
        provideZonelessChangeDetection()
      ],
      imports: [
        UserSettingsComponent,
        RouterModule.forRoot([])
      ]
    })
      .overrideComponent(UserSettingsComponent, {
        remove: {
          imports: [
            UserRepSettingsComponent,
            RouterLink
          ]
        },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should seed default rep settings when recommendations are toggled on (from empty)', async () => {
    //ARRANGE — get to a clean disabled/empty state
    component.userSettingsForm.recommendationsEnabled().value.set(false);
    component.userSettingsForm.repSettings().value.set([]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.userSettingsForm.repSettings.length).toBe(0);

    //ACT
    component.userSettingsForm.recommendationsEnabled().value.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    //ASSERT
    expect(component.userSettingsForm.recommendationsEnabled().value()).toBe(true);
    expect(component.userSettingsForm.repSettings.length).toBe(2);
  });

  it('should hide the rep settings section when recommendations are toggled off', async () => {
    //ARRANGE — mock starts enabled, so the section renders initially
    expect(fixture.nativeElement.querySelector('wt-user-rep-settings')).not.toBeNull();

    //ACT
    component.userSettingsForm.recommendationsEnabled().value.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    //ASSERT
    expect(component.userSettingsForm.recommendationsEnabled().value()).toBe(false);
    expect(fixture.nativeElement.querySelector('wt-user-rep-settings')).toBeNull();
  });

  it('should save settings', () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const messageService = TestBed.inject(NzMessageService);

    const duration = 240;
    const minTimedSetReps = 40;
    const maxTimedSetReps = 70;
    const minRepetitionSetReps = 6;
    const maxRepetitionSetReps = 10;

    const repSettings = component.userSettingsForm.repSettings;
    repSettings[0].minReps().value.set(minRepetitionSetReps);
    repSettings[0].maxReps().value.set(maxRepetitionSetReps);
    repSettings[1].duration().value.set(duration);
    repSettings[1].minReps().value.set(minTimedSetReps);
    repSettings[1].maxReps().value.set(maxTimedSetReps);

    const expectedSavedUser = <User>{};
    expectedSavedUser.settings = <UserSettings>{};
    expectedSavedUser.settings.repSettings = new Array<UserMinMaxReps>();
    expectedSavedUser.settings.repSettings.push(<UserMinMaxReps>{});
    expectedSavedUser.settings.repSettings[0].id = 1;
    expectedSavedUser.settings.repSettings[0].setType = SetType.REPETITION;
    expectedSavedUser.settings.repSettings[0].minReps = minRepetitionSetReps;
    expectedSavedUser.settings.repSettings[0].maxReps = maxRepetitionSetReps;
    expectedSavedUser.settings.repSettings[0].duration = null;
    expectedSavedUser.settings.repSettings.push(<UserMinMaxReps>{});
    expectedSavedUser.settings.repSettings[1].id = 2;
    expectedSavedUser.settings.repSettings[1].setType = SetType.TIMED;
    expectedSavedUser.settings.repSettings[1].minReps = minTimedSetReps;
    expectedSavedUser.settings.repSettings[1].maxReps = maxTimedSetReps;
    expectedSavedUser.settings.repSettings[1].duration = duration;
    expectedSavedUser.settings.recommendationsEnabled = true;

    //ACT
    component.saveSettings();

    //ASSERT
    expect(userService.update).toHaveBeenCalledWith(expectedSavedUser);
    expect(messageService.success).toHaveBeenCalledTimes(1);
    expect(messageService.success).toHaveBeenCalledWith('Settings saved.');
    expect(component.saving()).toBe(false);
  });
});
