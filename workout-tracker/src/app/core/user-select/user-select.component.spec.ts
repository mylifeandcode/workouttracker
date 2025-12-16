import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectComponent } from './user-select.component';
import { UserService } from '../_services/user/user.service';
import { of } from 'rxjs';
import { User } from 'app/core/_models/user';
import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';


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

  @Component({
  })
  class FakeComponent { };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: 'home', component: FakeComponent }]),
        UserSelectComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
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
      .overrideComponent(
        UserSelectComponent,
        {
          remove: { imports: [NzSpinModule] },
          add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        })
      .compileComponents();
  });

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
    expect(component.username()).toBe(userName);
    expect(router.navigate).toHaveBeenCalledOnceWith(['home']);

  });
});
