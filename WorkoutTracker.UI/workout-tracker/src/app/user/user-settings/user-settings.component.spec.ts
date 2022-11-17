import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { AuthService } from 'app/core/auth.service';
import { User } from 'app/core/models/user';
import { UserMinMaxReps } from 'app/core/models/user-min-max-reps';
import { UserSettings } from 'app/core/models/user-settings';
import { UserService } from 'app/core/user.service';
import { of } from 'rxjs';

import { UserSettingsComponent } from './user-settings.component';

class MockAuthService {}
class MockUserService {
  getById = jasmine.createSpy('getById').and.callFake(() => {
    const user = new User();
    user.settings = new UserSettings();
    user.settings.repSettings = new Array<UserMinMaxReps>();
    user.settings.repSettings.push(new UserMinMaxReps());

    return of(user);
  });
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
      ]
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
});
