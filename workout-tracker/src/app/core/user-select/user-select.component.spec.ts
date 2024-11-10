import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserSelectComponent } from './user-select.component';
import { UserService } from '../_services/user/user.service';
import { of } from 'rxjs';
import { User } from 'app/core/_models/user';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';


class UserServiceMock {
  //all$ = jasmine.createSpy('all$').and.returnValue(of(new Array<User>()));
  all$ = of(new Array<User>());
}

class AuthServiceMock {
  logIn = jasmine.createSpy('logIn').and.returnValue(of(true));
  public get loginRoute(): string {
    return "user-select";
  }
}

describe('UserSelectComponent', () => {
  let component: UserSelectComponent;
  let fixture: ComponentFixture<UserSelectComponent>;

  @Component({})
  class FakeComponent{};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        RouterModule.forRoot([{ path: 'home', component: FakeComponent }]),
        UserSelectComponent
    ],
    providers: [
        {
            provide: UserService,
            useClass: UserServiceMock
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
    fixture = TestBed.createComponent(UserSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select user', () => {

    //ARRANGE
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callThrough();
    const userId = 1;
    const userName = "davidleeroth";

    //ACT
    component.selectUser(userId, userName);

    //ASSERT
    expect(authService.logIn).toHaveBeenCalledOnceWith(userName, '');
    expect(component.username).toBe(userName);
    expect(router.navigate).toHaveBeenCalledOnceWith(['home']);

  });
});
