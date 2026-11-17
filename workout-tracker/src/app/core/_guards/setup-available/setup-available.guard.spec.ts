import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule, UrlTree } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { type Mocked } from 'vitest';
import { AuthService } from '../../_services/auth/auth.service';
import { SetupService } from '../../_services/setup/setup.service';
import { SetupAvailableGuard } from './setup-available.guard';

@Component({
  template: ''
})
class FakeComponent {
}

describe('SetupAvailableGuard', () => {
  let guard: SetupAvailableGuard;
  let setupRequired: boolean;

  beforeEach(() => {
    setupRequired = true;

    const SetupServiceMock: Partial<Mocked<SetupService>> = {
      isSetupRequired: vi.fn<SetupService['isSetupRequired']>().mockImplementation(() => of(setupRequired))
    };

    const AuthServiceMock: Partial<Mocked<AuthService>> = {
      get loginRoute() { return "user-select"; }
    };

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: 'user-select', component: FakeComponent }])
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SetupService, useValue: SetupServiceMock },
        { provide: AuthService, useValue: AuthServiceMock }
      ]
    });

    guard = TestBed.inject(SetupAvailableGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should let the setup page open while setup is required', async () => {
    //ACT
    const result = await firstValueFrom(guard.canActivate());

    //ASSERT
    expect(result).toBe(true);
  });

  it('should redirect to the login route once setup is complete', async () => {
    //ARRANGE
    setupRequired = false;
    const router = TestBed.inject(Router);

    //ACT
    const result = await firstValueFrom(guard.canActivate());

    //ASSERT
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/user-select');
  });
});
