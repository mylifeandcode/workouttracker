import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectComponent } from './user-select.component';
import { of } from 'rxjs';
import { UserProfileDTO } from '../../api';
import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { type Mocked } from 'vitest';

describe('UserSelectComponent', () => {
  let component: UserSelectComponent;
  let fixture: ComponentFixture<UserSelectComponent>;

  @Component({
    template: ''
  })
  class FakeComponent {
  }
  ;

  beforeEach(async () => {
    const AuthServiceMock: Partial<Mocked<AuthService>> = {
      getProfiles: vi.fn<AuthService['getProfiles']>().mockReturnValue(of(new Array<UserProfileDTO>())),
      logIn: vi.fn<AuthService['logIn']>().mockReturnValue(of(true)),
      get loginRoute() { return "user-select"; }
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: 'home', component: FakeComponent }]),
        UserSelectComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: AuthService,
          useValue: AuthServiceMock
        }
      ]
    })
      .overrideComponent(UserSelectComponent, {
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
    vi.spyOn(router, 'navigate');
    const userName = "davidleeroth";

    //ACT
    component.selectUser(userName);

    //ASSERT
    expect(authService.logIn).toHaveBeenCalledTimes(1);

    //ASSERT
    expect(authService.logIn).toHaveBeenCalledWith(userName, '');
    expect(component.username()).toBe(userName);
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['home']);

  });
});
