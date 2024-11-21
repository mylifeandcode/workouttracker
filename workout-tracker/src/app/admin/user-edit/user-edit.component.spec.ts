import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserEditComponent } from './user-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../core/_services/user/user.service';
import { of, throwError } from 'rxjs';
import { User } from 'app/core/_models/user';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from 'app/core/_services/auth/auth.service';

const CURRENT_USER_ID = 5150;

class UserServiceMock {
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User({id: CURRENT_USER_ID})));
  getById = jasmine.createSpy('getById').and.returnValue(of(new User()));
  add = jasmine.createSpy('add').and.returnValue(of(new User()));
  update = jasmine.createSpy('update').and.returnValue(of(new User()));
}

class AuthServiceMock {

}

@Component({
    standalone: false
})
class FakeComponent{};

describe('UserEditComponent', () => {
  let component: UserEditComponent;
  let fixture: ComponentFixture<UserEditComponent>;
  let userService: UserService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        RouterModule.forRoot([{ path: 'admin/users', component: FakeComponent }]),
        UserEditComponent
    ],
    providers: [
        {
            provide: UserService,
            useClass: UserServiceMock
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
            useClass: AuthServiceMock
        }
    ]
})
    .compileComponents();
  }));

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
    expect(component.userEditForm.controls.id).toBeTruthy();
    expect(component.userEditForm.controls.name).toBeTruthy();
  });

  it('should get user info when route specifies a user ID', () => {
    expect(userService.getById).toHaveBeenCalledTimes(1);
  });

  it('should update existing user', () => {
    //ARRANGE
    const expectedUser = new User({id: 100, name: 'Big Jim Slade', role: 2});
    component.userEditForm.controls.id.setValue(expectedUser.id);
    component.userEditForm.controls.name.setValue(expectedUser.name);
    component.userEditForm.controls.role.setValue(2);

    //ACT
    component.saveUser();

    //ASSERT
    expect(userService.update).toHaveBeenCalledWith(expectedUser);
  });

  it('should populate error message when error occurs while saving user info', () => {
    //ARRANGE
    userService.update = jasmine.createSpy('update').and.returnValue(throwError(() => new Error("Something bad happened.")));
    component.userEditForm.controls.id.setValue(100);
    component.userEditForm.controls.name.setValue('Doug');

    //ACT
    component.saveUser();

    //ASSERT
    expect(userService.update).toHaveBeenCalled();
    expect(component.errorMsg).toBe("An error has occurred. Please contact an administrator.");
  });

  it('should populate error message when user does not have permissions to save user info', () => {
    //ARRANGE
    //userService.update = jasmine.createSpy('update').and.returnValue(throwError(() => { status: 403 }));
    const error = { status: 403 };
    userService.update = jasmine.createSpy('update').and.returnValue(throwError(() => error));
    component.userEditForm.controls.id.setValue(100);
    component.userEditForm.controls.name.setValue('Doug');

    //ACT
    component.saveUser();

    //ASSERT
    expect(userService.update).toHaveBeenCalled();
    expect(component.errorMsg).toBe("You do not have permission to add or edit users.");
  });

});
