import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/core/auth.service';
import { SetType } from 'app/core/enums/set-type';
import { User } from 'app/core/models/user';
import { UserMinMaxReps } from 'app/core/models/user-min-max-reps';
import { UserSettings } from 'app/core/models/user-settings';
import { UserService } from 'app/core/user.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { of } from 'rxjs';

import { UserSettingsComponent } from './user-settings.component';

class MockAuthService {}
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

  update = jasmine.createSpy('update').and.callFake((user: User) => { return of(user); });
}

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSettingsComponent ], 
      providers: [
        FormBuilder, 
        {
          provide: AuthService, 
          useClass: MockAuthService
        }, 
        {
          provide: UserService, 
          useClass: MockUserService
        }
      ],
      imports: [ 
        ReactiveFormsModule, 
        InputSwitchModule //Importing this module because using CUSTOM_ELEMENTS_SCHEMA wasn't working due to the input switch's formControlName assignment
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
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
    expect(component.userSettingsForm.controls.recommendationsEnabled.value).toBeTruthy();
  });

  it('should toggle recommendations setting off', () => {
    component.recommendationEngineToggled({ originalEvent: null, checked: false });
    expect(component.userSettingsForm.controls.recommendationsEnabled.value).toBeFalsy();
  });
  
  it('should save settings', () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const expectedSavedUser = new User();
    const duration = 240;
    const minTimedSetReps = 40;
    const maxTimedSetReps = 70;
    const minRepetitionSetReps = 6;
    const maxRepetitionSetReps = 10;
    component.userSettingsForm.controls.repSettings.controls[0].controls.minReps.setValue(minRepetitionSetReps);
    component.userSettingsForm.controls.repSettings.controls[0].controls.maxReps.setValue(maxRepetitionSetReps);
    component.userSettingsForm.controls.repSettings.controls[1].controls.duration.setValue(duration);
    component.userSettingsForm.controls.repSettings.controls[1].controls.minReps.setValue(minTimedSetReps);
    component.userSettingsForm.controls.repSettings.controls[1].controls.maxReps.setValue(maxTimedSetReps);
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
  });
});
