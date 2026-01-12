import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/_services/auth/auth.service';
import { SetType } from '../../workouts/workout/_enums/set-type';
import { User } from '../../core/_models/user';
import { UserMinMaxReps } from '../../core/_models/user-min-max-reps';
import { UserSettings } from '../../core/_models/user-settings';
import { UserService } from '../../core/_services/user/user.service';
import { of } from 'rxjs';

import { UserSettingsComponent } from './user-settings.component';
import { RouterLink, RouterModule } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserRepSettingsComponent } from './user-rep-settings/user-rep-settings.component';

class MockAuthService {
    userId: number = 0;
    userPublicId: string = 'some-guid';
}

class MockUserService {
    getById = vi.fn().mockImplementation(() => {
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

    update = vi.fn().mockImplementation((user: User) => of(user));
}

class NzMessageServiceMock {
    success = vi.fn();
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
                    provide: NzMessageService,
                    useClass: NzMessageServiceMock
                },
                provideZonelessChangeDetection()
            ],
            imports: [
                ReactiveFormsModule,
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

    it('should toggle recommendations setting on', () => {
        //ARRANGE
        component.userSettingsForm?.removeControl('repSettings');
        component.userSettingsForm?.controls.recommendationsEnabled.setValue(false);

        //ACT

        //Kinda goofy, but let's immediately change back to true for this
        component.userSettingsForm?.controls.recommendationsEnabled.setValue(true);
        component.recommendationEngineToggled();

        //ASSERT
        expect(component.userSettingsForm?.controls.recommendationsEnabled.value).toBeTruthy();
        expect(component.userSettingsForm?.controls.repSettings).toBeDefined();
    });

    it('should toggle recommendations setting off', () => {
        //ARRANGE
        //Nothing extra to do for this one

        //ACT
        component.userSettingsForm?.controls.recommendationsEnabled.setValue(false);
        component.recommendationEngineToggled();

        //ASSERT
        expect(component.userSettingsForm?.controls.recommendationsEnabled.value).toBeFalsy();
        expect(component.userSettingsForm?.controls.repSettings).not.toBeDefined();
    });

    it('should save settings', () => {
        //ARRANGE
        const userService = TestBed.inject(UserService);
        const messageService = TestBed.inject(NzMessageService);

        const expectedSavedUser = new User();
        const duration = 240;
        const minTimedSetReps = 40;
        const maxTimedSetReps = 70;
        const minRepetitionSetReps = 6;
        const maxRepetitionSetReps = 10;

        if (component.userSettingsForm === undefined) {
            throw new Error('userSettingsForm is undefined');
        }
        else if (component.userSettingsForm.controls.repSettings === undefined) {
            throw new Error('userSettingsForm.controls.repSettings is undefined');
        }
        else {
            component.userSettingsForm.controls.repSettings.controls[0].controls.minReps.setValue(minRepetitionSetReps);
            component.userSettingsForm.controls.repSettings.controls[0].controls.maxReps.setValue(maxRepetitionSetReps);
            component.userSettingsForm.controls.repSettings.controls[1].controls.duration.setValue(duration);
            component.userSettingsForm.controls.repSettings.controls[1].controls.minReps.setValue(minTimedSetReps);
            component.userSettingsForm.controls.repSettings.controls[1].controls.maxReps.setValue(maxTimedSetReps);
        }

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
        expect(messageService.success).toHaveBeenCalledTimes(1);
        expect(messageService.success).toHaveBeenCalledWith('Settings saved.');
        expect(component.saving()).toBe(false);
    });
});
