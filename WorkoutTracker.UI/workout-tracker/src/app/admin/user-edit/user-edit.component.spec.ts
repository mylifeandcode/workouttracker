import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserEditComponent } from './user-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../core/user.service';
import { of } from 'rxjs';
import { User } from 'app/core/models/user';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

const CURRENT_USER_ID = 5150;

class UserServiceMock {
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User({id: CURRENT_USER_ID})));
  getUserInfo = jasmine.createSpy('getUserInfo').and.returnValue(of(new User()));
  addUser = jasmine.createSpy('addUser').and.returnValue(of(new User()));
  updateUser = jasmine.createSpy('updateUser').and.returnValue(of(new User()));
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

  it('should create the form', waitForAsync(() => {
    fixture.whenStable().then(() => {
      expect(component.userEditForm).toBeTruthy();
      expect(component.userEditForm.controls.id).toBeTruthy();
      expect(component.userEditForm.controls.name).toBeTruthy();
    });
  }));

  it('should get user info when route specifies a user ID', waitForAsync(() => {
    fixture.whenStable().then(() => {
      const userService = TestBed.inject(UserService);
      expect(userService.getUserInfo).toHaveBeenCalledTimes(1);
    });
  }));

  it('should add new user', waitForAsync(() => {
    fixture.whenStable().then(() => {
      //ARRANGE
      const userService = TestBed.inject(UserService);
      const expectedUser = new User({id: 0, name: 'Dr. Klahn'});
      component.userEditForm.controls.id.setValue(expectedUser.id);
      component.userEditForm.controls.name.setValue(expectedUser.name);

      //ACT
      component.saveUser();

      //ASSERT
      expect(userService.addUser).toHaveBeenCalledWith(expectedUser);
    });
  }));

  it('should update existing user', waitForAsync(() => {
    fixture.whenStable().then(() => {
      //ARRANGE
      const userService = TestBed.inject(UserService);
      const expectedUser = new User({id: 100, name: 'Big Jim Slade'});
      component.userEditForm.controls.id.setValue(expectedUser.id);
      component.userEditForm.controls.name.setValue(expectedUser.name);

      //ACT
      component.saveUser();

      //ASSERT
      expect(userService.updateUser).toHaveBeenCalledWith(expectedUser);
    });
  }));

});
