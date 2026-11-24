import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectComponent } from './user-select.component';
import { of } from 'rxjs';
import { UserProfileDTO } from '../../api';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { type Mocked } from 'vitest';

describe('UserSelectComponent', () => {
  let component: UserSelectComponent;
  let fixture: ComponentFixture<UserSelectComponent>;

  const authServiceMock: Mocked<Pick<AuthService, 'getProfiles' | 'logIn' | 'loginRoute'>> = {
    getProfiles: vi.fn<AuthService['getProfiles']>(() => of(new Array<UserProfileDTO>())).mockName('getProfiles'),
    logIn: vi.fn<AuthService['logIn']>(() => of(true)).mockName('logIn'),
    get loginRoute() { return "user-select"; }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSelectComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: AuthService,
          useValue: authServiceMock
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

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks(); //Undoes the router.navigate spy
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select user', () => {

    //ARRANGE
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true); //No routes are registered, so don't let a real navigation run
    const userName = "davidleeroth";

    //ACT
    component.selectUser(userName);

    //ASSERT
    expect(authServiceMock.logIn).toHaveBeenCalledTimes(1);

    //ASSERT
    expect(authServiceMock.logIn).toHaveBeenCalledWith(userName, '');
    expect(component.username()).toBe(userName);
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['home']);

  });
});
