import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/_services/auth/auth.service';
import { User, UserMinMaxReps, UserSettings, UserSettingsUpdateDTO, SetType } from '../../api';
import { UserService } from '../../core/_services/user/user.service';
import { of } from 'rxjs';
import { type Mocked } from 'vitest';

import { UserSettingsComponent } from './user-settings.component';
import { provideRouter, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserRepSettingsComponent } from './user-rep-settings/user-rep-settings.component';

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;

  const authServiceMock: Mocked<Pick<AuthService, 'userId' | 'userPublicId'>> = {
    userId: 0,
    userPublicId: 'some-guid'
  };

  const userServiceMock: Mocked<Pick<UserService, 'getById' | 'updateMySettings'>> = {
    getById: vi.fn<UserService['getById']>(() => {
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
      user.settings.lowestAcceptableRating = 3;

      return of(user);
    }).mockName('getById'),
    updateMySettings: vi.fn<UserService['updateMySettings']>(() => of(undefined)).mockName('updateMySettings')
  };

  const messageServiceMock: Mocked<Pick<NzMessageService, 'success'>> = {
    success: vi.fn<NzMessageService['success']>().mockName('success')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: UserService,
          useValue: userServiceMock
        },
        {
          provide: NzMessageService,
          useValue: messageServiceMock
        },
        provideZonelessChangeDetection()
      ],
      imports: [
        UserSettingsComponent
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

  afterEach(() => {
    vi.resetAllMocks();
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

    //Only the settings are sent: no user id, no role.
    const expectedSettings: UserSettingsUpdateDTO = {
      recommendationsEnabled: true,
      lowestAcceptableRating: 3,
      repSettings: [
        { id: 1, setType: SetType.REPETITION, duration: null, minReps: minRepetitionSetReps, maxReps: maxRepetitionSetReps },
        { id: 2, setType: SetType.TIMED, duration: duration, minReps: minTimedSetReps, maxReps: maxTimedSetReps }
      ]
    };

    //ACT
    component.saveSettings();

    //ASSERT
    expect(userServiceMock.updateMySettings).toHaveBeenCalledWith(expectedSettings);
    expect(messageServiceMock.success).toHaveBeenCalledTimes(1);
    expect(messageServiceMock.success).toHaveBeenCalledWith('Settings saved.');
    expect(component.saving()).toBe(false);
  });

  it('should send the loaded rep settings back unchanged when recommendations are switched off', () => {
    //ARRANGE
    component.userSettingsForm.recommendationsEnabled().value.set(false);

    //ACT
    component.saveSettings();

    //ASSERT
    const sent = userServiceMock.updateMySettings.mock.calls.at(-1)![0];
    expect(sent.recommendationsEnabled).toBe(false);
    expect(sent.repSettings.map(r => r.id)).toEqual([1, 2]);
  });
});
