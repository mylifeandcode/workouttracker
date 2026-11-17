import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditComponent } from './user-edit.component';
import { UserService } from '../../core/_services/user/user.service';
import { of, throwError } from 'rxjs';
import { User } from '../../api';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from '../../core/_services/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { type Mocked } from 'vitest';
import { ConfigService } from '../../core/_services/config/config.service';

//const CURRENT_USER_ID = 5150;

@Component({
  template: ''
})
class FakeComponent {
}

describe('UserEditComponent', () => {
  let component: UserEditComponent;
  let fixture: ComponentFixture<UserEditComponent>;
  let userService: UserService;

  beforeEach(async () => {
    const UserServiceMock: Partial<Mocked<UserService>> = {
      getById: vi.fn<UserService['getById']>().mockReturnValue(of(<User>{})),
      add: vi.fn().mockReturnValue(of(<User>{})),
      updateUser: vi.fn<UserService['updateUser']>().mockReturnValue(of(undefined)),
      createPasswordReset: vi.fn<UserService['createPasswordReset']>().mockReturnValue(of({ token: 'theToken', expiresAt: new Date('2026-11-17T13:00:00Z') }))
    };
    
    const AuthServiceMock: Partial<Mocked<AuthService>> = {};

    const ConfigServiceMock: Partial<Mocked<ConfigService>> = {
      get: vi.fn<ConfigService['get']>().mockImplementation(() => {
        return true;
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: 'admin/users', component: FakeComponent }]),
        UserEditComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: UserService,
          useValue: UserServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              id: 5
            })
          }
        },
        {
          provide: AuthService,
          useValue: AuthServiceMock
        },
        {
          provide: ConfigService,
          useValue: ConfigServiceMock
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEditComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    fixture.componentRef.setInput('userId', 5);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form', () => {
    expect(component.userEditForm).toBeTruthy();
    expect(component.userEditForm.id).toBeTruthy();
    expect(component.userEditForm.name).toBeTruthy();
  });

  it('should get user info when route specifies a user ID', () => {
    expect(userService.getById).toHaveBeenCalledTimes(1);
  });

  /** Fills the form with valid values so submit() will run its save action. */
  const fillValidForm = (): void => {
    component.userEditForm.name().value.set('Big Jim Slade');
    component.userEditForm.emailAddress().value.set('jim@workouttracker.com');
    component.userEditForm.role().value.set('2');
  };

  const PUBLIC_ID = '4b0f0c1e-3c1a-4f57-9d3a-0c6a7d2a9a11';

  it('should update an existing user, sending only name, email address and role', async () => {
    //ARRANGE
    component.userEditForm.publicId().value.set(PUBLIC_ID);
    fillValidForm();

    //ACT
    component.saveUser();
    await fixture.whenStable(); //submit() runs its action asynchronously

    //ASSERT
    expect(userService.updateUser).toHaveBeenCalledTimes(1);
    expect(userService.updateUser).toHaveBeenCalledWith(PUBLIC_ID, {
      userName: 'Big Jim Slade',
      emailAddress: 'jim@workouttracker.com',
      role: 2 //Converted from the string model value
    });
  });

  it('should populate error message when error occurs while saving user info', async () => {
    //ARRANGE
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    userService.updateUser = vi.fn<UserService['updateUser']>().mockReturnValue(throwError(() => httpError));
    component.userEditForm.publicId().value.set(PUBLIC_ID);
    fillValidForm();

    //ACT
    component.saveUser();
    await fixture.whenStable();

    //ASSERT
    expect(userService.updateUser).toHaveBeenCalled();
    expect(component.errorMsg()).toBe("We couldn't save your changes. Please try again.");
  });

  it('should populate error message when user does not have permissions to save user info', async () => {
    //ARRANGE
    const httpError = new HttpErrorResponse({ status: 403 });
    userService.updateUser = vi.fn<UserService['updateUser']>().mockReturnValue(throwError(() => httpError));
    component.userEditForm.publicId().value.set(PUBLIC_ID);
    fillValidForm();

    //ACT
    component.saveUser();
    await fixture.whenStable();

    //ASSERT
    expect(userService.updateUser).toHaveBeenCalled();
    expect(component.errorMsg()).toBe("You do not have permission to edit users.");
  });

  it("should show the API's explanation when a change is refused", async () => {
    //ARRANGE
    const httpError = new HttpErrorResponse({
      status: 409,
      error: { status: 409, detail: "The last administrator can't be demoted." }
    });
    userService.updateUser = vi.fn<UserService['updateUser']>().mockReturnValue(throwError(() => httpError));
    component.userEditForm.publicId().value.set(PUBLIC_ID);
    fillValidForm();

    //ACT
    component.saveUser();
    await fixture.whenStable();

    //ASSERT
    expect(component.errorMsg()).toBe("The last administrator can't be demoted.");
  });

  it('should create a one-time password reset for the user and show the link, with the token after a hash mark', () => {
    //ARRANGE
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alert = vi.spyOn(window, 'alert').mockReturnValue(undefined);
    component.userEditForm.publicId().value.set(PUBLIC_ID);

    //ACT
    component.resetPassword();

    //ASSERT
    expect(userService.createPasswordReset).toHaveBeenCalledWith(PUBLIC_ID);
    const message = alert.mock.calls.at(-1)![0] as string;
    expect(message).toContain('/user/reset-password#token=theToken');
    expect(message).not.toContain('/user/reset-password/theToken');
  });

  it('should not create a password reset when the administrator cancels', () => {
    //ARRANGE
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const createPasswordReset = vi.mocked(userService.createPasswordReset);
    createPasswordReset.mockClear();

    //ACT
    component.resetPassword();

    //ASSERT
    expect(createPasswordReset).not.toHaveBeenCalled();
  });
});
