import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserSelectComponent } from './user-select.component';
import { UserService } from '../core/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { User } from 'app/core/models/user';
import { Component } from '@angular/core';
import { Router } from '@angular/router';


class UserServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new Array<User>()));
  logIn = jasmine.createSpy('logIn').and.returnValue(of(new User()));
}

describe('UserSelectComponent', () => {
  let component: UserSelectComponent;
  let fixture: ComponentFixture<UserSelectComponent>;

  @Component({})
  class FakeComponent{};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSelectComponent ],
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'home', component: FakeComponent}])
      ],
      providers: [
        {
          provide: UserService,
          useClass: UserServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get all users', () => {

    //ARRANGE
    const userService = TestBed.inject(UserService);

    //ACT
    //Nothing else to do here

    //ASSERT
    expect(userService.getAll).toHaveBeenCalledTimes(1);

  });

  it('should select user', () => {

    //ARRANGE
    const userService = TestBed.inject(UserService);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callThrough();
    const userId = 1;
    const userName = "davidleeroth";

    //ACT
    component.selectUser(userId, userName);

    //ASSERT
    expect(userService.setLoggedInUser).toHaveBeenCalledOnceWith(userId);
    expect(component.username).toBe(userName);
    expect(router.navigate).toHaveBeenCalledOnceWith(['home']);

  });
});
