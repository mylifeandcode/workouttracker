import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule, UrlTree } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { type Mocked } from 'vitest';
import { SetupService } from '../../_services/setup/setup.service';
import { SetupRequiredGuard } from './setup-required.guard';

@Component({
  template: ''
})
class FakeComponent {
}

describe('SetupRequiredGuard', () => {
  let guard: SetupRequiredGuard;
  let setupRequired: boolean;

  beforeEach(() => {
    setupRequired = true;

    const SetupServiceMock: Partial<Mocked<SetupService>> = {
      isSetupRequired: vi.fn<SetupService['isSetupRequired']>().mockImplementation(() => of(setupRequired))
    };

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: 'setup', component: FakeComponent }])
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SetupService, useValue: SetupServiceMock }
      ]
    });

    guard = TestBed.inject(SetupRequiredGuard);
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
