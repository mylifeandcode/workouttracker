import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { type Mocked } from 'vitest';
import { AuthService } from '../../_services/auth/auth.service';
import { SetupService } from '../../_services/setup/setup.service';
import { SetupAvailableGuard } from './setup-available.guard';

describe('SetupAvailableGuard', () => {
  let guard: SetupAvailableGuard;
  let setupRequired: boolean;

  const setupServiceMock: Mocked<Pick<SetupService, 'isSetupRequired'>> = {
    isSetupRequired: vi.fn<SetupService['isSetupRequired']>(() => of(setupRequired)).mockName('isSetupRequired')
  };

  const authServiceMock: Mocked<Pick<AuthService, 'loginRoute'>> = {
    get loginRoute() { return "user-select"; }
  };

  beforeEach(() => {
    setupRequired = true;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: SetupService, useValue: setupServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    guard = TestBed.inject(SetupAvailableGuard);
  });

  afterEach(() => {
    vi.resetAllMocks();
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
