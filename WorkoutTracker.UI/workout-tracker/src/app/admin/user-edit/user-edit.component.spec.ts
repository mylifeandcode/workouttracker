import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserEditComponent } from './user-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../core/user.service';
import { of, throwError } from 'rxjs';
import { User } from 'app/core/models/user';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

const CURRENT_USER_ID = 5150;

class UserServiceMock {
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User({id: CURRENT_USER_ID})));
  getById = jasmine.createSpy('getById').and.returnValue(of(new User()));
  add = jasmine.createSpy('add').and.returnValue(of(new User()));
  update = jasmine.createSpy('update').and.returnValue(of(new User()));
}

@Component({})
class FakeComponent{};

describe('UserEditComponent', () => {
  let component: UserEditComponent;
  let fixture: ComponentFixture<UserEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEditComponent ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes(
          [{path: 'admin/users', component: FakeComponent}])
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
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEditComponent);
    component = fixture.componentInstance;
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
    const userService = TestBed.inject(UserService);
    expect(userService.getById).toHaveBeenCalledTimes(1);
  });

  it('should add new user', () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const expectedUser = new User({id: 0, name: 'Dr. Klahn'});
    component.userEditForm.controls.id.setValue(expectedUser.id);
    component.userEditForm.controls.name.setValue(expectedUser.name);

    //ACT
    component.saveUser();

    //ASSERT
    expect(userService.add).toHaveBeenCalledWith(expectedUser);
  });

  it('should update existing user', () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const expectedUser = new User({id: 100, name: 'Big Jim Slade'});
    component.userEditForm.controls.id.setValue(expectedUser.id);
    component.userEditForm.controls.name.setValue(expectedUser.name);

    //ACT
    component.saveUser();

    //ASSERT
    expect(userService.update).toHaveBeenCalledWith(expectedUser);
  });

  it('should populate error message when error occurs while saving user info', () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    userService.update = jasmine.createSpy('update').and.returnValue(throwError(new Error("Something bad happened.")));
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
    const userService = TestBed.inject(UserService);
    userService.update = jasmine.createSpy('update').and.returnValue(throwError({ status: 403 }));
    component.userEditForm.controls.id.setValue(100);
    component.userEditForm.controls.name.setValue('Doug');

    //ACT
    component.saveUser();

    //ASSERT
    expect(userService.update).toHaveBeenCalled();
    expect(component.errorMsg).toBe("You do not have permission to add or edit users.");
  });

});
