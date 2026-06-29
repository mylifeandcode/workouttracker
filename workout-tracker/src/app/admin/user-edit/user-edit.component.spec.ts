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
      update: vi.fn<UserService['update']>().mockReturnValue(of(<User>{}))
    };
    const AuthServiceMock: Partial<Mocked<AuthService>> = {};

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
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEditComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
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

  it('should update existing user', async () => {
    //ARRANGE
    component.userEditForm.id().value.set(100);
    fillValidForm();

    //ACT
    component.saveUser();
    await fixture.whenStable(); //submit() runs its action asynchronously

    //ASSERT
    expect(userService.update).toHaveBeenCalledTimes(1);
    const updated = vi.mocked(userService.update).mock.calls[0][0];
    expect(updated.id).toEqual(100);
    expect(updated.name).toEqual('Big Jim Slade');
    expect(updated.role).toEqual(2); //Converted from the string model value
  });

  it('should populate error message when error occurs while saving user info', async () => {
    //ARRANGE
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    userService.update = vi.fn<UserService['update']>().mockReturnValue(throwError(() => httpError));
    component.userEditForm.id().value.set(100);
    fillValidForm();

    //ACT
    component.saveUser();
    await fixture.whenStable();

    //ASSERT
    expect(userService.update).toHaveBeenCalled();
    expect(component.errorMsg()).toBe(httpError.message);
  });

  it('should populate error message when user does not have permissions to save user info', async () => {
    //ARRANGE
    const httpError = new HttpErrorResponse({ status: 403 });
    userService.update = vi.fn<UserService['update']>().mockReturnValue(throwError(() => httpError));
    component.userEditForm.id().value.set(100);
    fillValidForm();

    //ACT
    component.saveUser();
    await fixture.whenStable();

    //ASSERT
    expect(userService.update).toHaveBeenCalled();
    expect(component.errorMsg()).toBe("You do not have permission to add or edit users.");
  });

});
