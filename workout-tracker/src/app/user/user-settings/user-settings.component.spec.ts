import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { SetType } from 'app/workouts/workout/_enums/set-type';
import { User } from 'app/core/_models/user';
import { UserMinMaxReps } from 'app/core/_models/user-min-max-reps';
import { UserSettings } from 'app/core/_models/user-settings';
import { UserService } from 'app/core/_services/user/user.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { of } from 'rxjs';

import { UserSettingsComponent } from './user-settings.component';
import { MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';

class MockAuthService {
  userId: number = 0;
  userPublicId: string = 'some-guid';
}

class MockUserService {
  getById = jasmine.createSpy('getById').and.callFake(() => {
    const user = new User();
    user.settings = new UserSettings();
    user.settings.repSettings = new Array<UserMinMaxReps>();
    user.settings.repSettings.push(new UserMinMaxReps());
    user.settings.repSettings.push(new UserMinMaxReps());
    user.settings.repSettings[0].setType = SetType.Repetition;
    user.settings.repSettings[0].id = 1;
    user.settings.repSettings[1].setType = SetType.Timed;
    user.settings.repSettings[1].id = 2;
    user.settings.recommendationsEnabled = true;

    return of(user);
  });

  update = jasmine.createSpy('update').and.callFake((user: User) => of(user));
}

class MessageServiceMock {
  add = jasmine.createSpy('add');
}

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        }
      ],
      imports: [
        ReactiveFormsModule,
        InputSwitchModule, //Importing this module because using CUSTOM_ELEMENTS_SCHEMA wasn't working due to the input switch's formControlName assignment
        UserSettingsComponent,
        RouterModule.forRoot([])
      ]
    })
      .overrideComponent(
        UserSettingsComponent,
        {
          remove: { imports: [ToastModule] }, //Was getting an error about an undefined object before doing this, despite importing everything the component did
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

  it('should toggle recommendations setting on', () => {
    component.recommendationEngineToggled({ originalEvent: null, checked: true });
    expect(component.userSettingsForm?.controls.recommendationsEnabled.value).toBeTruthy();
  });

  it('should toggle recommendations setting off', () => {
    component.recommendationEngineToggled({ originalEvent: null, checked: false });
    expect(component.userSettingsForm?.controls.recommendationsEnabled.value).toBeFalsy();
  });

  it('should save settings', () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const messageService = TestBed.inject(MessageService);

    const expectedSavedUser = new User();
    const duration = 240;
    const minTimedSetReps = 40;
    const maxTimedSetReps = 70;
    const minRepetitionSetReps = 6;
    const maxRepetitionSetReps = 10;
    component.userSettingsForm?.controls.repSettings.controls[0].controls.minReps.setValue(minRepetitionSetReps);
    component.userSettingsForm?.controls.repSettings.controls[0].controls.maxReps.setValue(maxRepetitionSetReps);
    component.userSettingsForm?.controls.repSettings.controls[1].controls.duration.setValue(duration);
    component.userSettingsForm?.controls.repSettings.controls[1].controls.minReps.setValue(minTimedSetReps);
    component.userSettingsForm?.controls.repSettings.controls[1].controls.maxReps.setValue(maxTimedSetReps);
    expectedSavedUser.settings = new UserSettings();
    expectedSavedUser.settings.repSettings = new Array<UserMinMaxReps>();
    expectedSavedUser.settings.repSettings.push(new UserMinMaxReps());
    expectedSavedUser.settings.repSettings[0].id = 1;
    expectedSavedUser.settings.repSettings[0].setType = SetType.Repetition;
    expectedSavedUser.settings.repSettings[0].minReps = minRepetitionSetReps;
    expectedSavedUser.settings.repSettings[0].maxReps = maxRepetitionSetReps;
    expectedSavedUser.settings.repSettings[0].duration = null;
    expectedSavedUser.settings.repSettings.push(new UserMinMaxReps());
    expectedSavedUser.settings.repSettings[1].id = 2;
    expectedSavedUser.settings.repSettings[1].setType = SetType.Timed;
    expectedSavedUser.settings.repSettings[1].minReps = minTimedSetReps;
    expectedSavedUser.settings.repSettings[1].maxReps = maxTimedSetReps;
    expectedSavedUser.settings.repSettings[1].duration = duration;
    expectedSavedUser.settings.recommendationsEnabled = true;

    //ACT
    component.saveSettings();

    //ASSERT
    expect(userService.update).toHaveBeenCalledWith(expectedSavedUser);
    expect(messageService.add).toHaveBeenCalledOnceWith({ severity: 'success', summary: 'Successful', detail: 'Settings saved.', life: 3000 });
  });
});
