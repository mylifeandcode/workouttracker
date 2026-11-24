import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { type Mocked } from 'vitest';
import { SetupService } from '../../_services/setup/setup.service';
import { SetupRequiredGuard } from './setup-required.guard';

describe('SetupRequiredGuard', () => {
  let guard: SetupRequiredGuard;
  let setupRequired: boolean;

  const setupServiceMock: Mocked<Pick<SetupService, 'isSetupRequired'>> = {
    isSetupRequired: vi.fn<SetupService['isSetupRequired']>(() => of(setupRequired)).mockName('isSetupRequired')
  };

  beforeEach(() => {
    setupRequired = true;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: SetupService, useValue: setupServiceMock }
      ]
    });

    guard = TestBed.inject(SetupRequiredGuard);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to the setup page while setup is required', async () => {
    //ARRANGE
    const router = TestBed.inject(Router);

    //ACT
    const result = await firstValueFrom(guard.canActivate());

    //ASSERT
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/setup');
  });

  it('should let the route activate once setup is complete', async () => {
    //ARRANGE
    setupRequired = false;

    //ACT
    const result = await firstValueFrom(guard.canActivate());

    //ASSERT
    expect(result).toBe(true);
  });
});
