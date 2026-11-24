import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { type Mocked } from 'vitest';

import { SetupComponent } from './setup.component';
import { AuthService } from '../_services/auth/auth.service';
import { NotificationService } from '../_services/notification/notification.service';
import { SetupService } from '../_services/setup/setup.service';

describe('SetupComponent', () => {
  let component: SetupComponent;
  let fixture: ComponentFixture<SetupComponent>;
  let router: Router;

  const setupServiceMock: Mocked<Pick<SetupService, 'createFirstAdmin'>> = {
    createFirstAdmin: vi.fn<SetupService['createFirstAdmin']>(() => of(undefined)).mockName('createFirstAdmin')
  };

  const authServiceMock: Mocked<Pick<AuthService, 'loginRoute'>> = {
    get loginRoute() { return "user-select"; }
  };

  const notificationServiceMock: Mocked<Pick<NotificationService, 'success'>> = {
    success: vi.fn<NotificationService['success']>().mockName('success')
  };

  const VALID_PASSWORD = 'a-long-enough-password';

  function fillInValidForm(): void {
    component.setupForm.userName().value.set('  jtkirk  ');
    component.setupForm.emailAddress().value.set('jtkirk@ufp.org'); //Padding would (correctly) fail the email validator.
    component.setupForm.password().value.set(VALID_PASSWORD);
    component.setupForm.confirmPassword().value.set(VALID_PASSWORD);
    component.setupForm.setupCode().value.set(' ABCD-EFGH-JKMN-PQRS ');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: SetupService, useValue: setupServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ],
      imports: [SetupComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SetupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true); //No routes are registered, so don't let a real navigation run
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks(); //Undoes the router.navigate spy
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid, empty form that is not busy', () => {
    expect(component.setupForm().invalid()).toBe(true);
    expect(component.creatingAdministrator()).toBe(false);
  });

  it('should be valid once everything is filled in correctly', () => {
    fillInValidForm();

    expect(component.setupForm().invalid()).toBe(false);
  });

  it('should require a password of at least 12 characters', () => {
    fillInValidForm();
    component.setupForm.password().value.set('short');
    component.setupForm.confirmPassword().value.set('short');

    expect(component.setupForm.password().errors().some(e => e.kind === 'minLength')).toBe(true);
  });

  it('should require the passwords to match', () => {
    fillInValidForm();
    component.setupForm.confirmPassword().value.set('something-else-entirely');

    expect(component.setupForm.confirmPassword().errors().some(e => e.kind === 'passwordsMatch')).toBe(true);
  });

  it('should require a valid email address', () => {
    fillInValidForm();
    component.setupForm.emailAddress().value.set('not-an-email');

    expect(component.setupForm.emailAddress().errors().some(e => e.kind === 'email')).toBe(true);
  });

  it('should create the administrator, then announce it and go to the login route', async () => {
    //ARRANGE
    fillInValidForm();

    //ACT
    component.createAdministrator();
    await fixture.whenStable(); //submit() runs its action asynchronously

    //ASSERT
    expect(setupServiceMock.createFirstAdmin).toHaveBeenCalledWith({
      userName: 'jtkirk',
      emailAddress: 'jtkirk@ufp.org',
      password: VALID_PASSWORD,
      setupCode: 'ABCD-EFGH-JKMN-PQRS'
    });
    expect(notificationServiceMock.success).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['user-select']);
    expect(component.creatingAdministrator()).toBe(false);
  });

  it('should stay on the page when the API rejects the request', async () => {
    //ARRANGE
    setupServiceMock.createFirstAdmin.mockReturnValue(throwError(() => new Error('Bad request')));
    fillInValidForm();

    //ACT
    component.createAdministrator();
    await fixture.whenStable();

    //ASSERT
    expect(notificationServiceMock.success).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.creatingAdministrator()).toBe(false);
  });

  it('should not submit an invalid form', async () => {
    //ACT
    component.createAdministrator();
    await fixture.whenStable();

    //ASSERT
    expect(setupServiceMock.createFirstAdmin).not.toHaveBeenCalled();
  });
});
