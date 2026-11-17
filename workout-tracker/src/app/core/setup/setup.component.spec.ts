import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { type Mocked } from 'vitest';

import { SetupComponent } from './setup.component';
import { AuthService } from '../_services/auth/auth.service';
import { NotificationService } from '../_services/notification/notification.service';
import { SetupService } from '../_services/setup/setup.service';

@Component({
  selector: 'wt-blank',
  template: ''
})
class BlankComponent {
}

describe('SetupComponent', () => {
  let component: SetupComponent;
  let fixture: ComponentFixture<SetupComponent>;
  let router: Router;
  let setupService: Mocked<SetupService>;
  let notificationService: Mocked<NotificationService>;

  const VALID_PASSWORD = 'a-long-enough-password';

  function fillInValidForm(): void {
    component.setupForm.userName().value.set('  jtkirk  ');
    component.setupForm.emailAddress().value.set('jtkirk@ufp.org'); //Padding would (correctly) fail the email validator.
    component.setupForm.password().value.set(VALID_PASSWORD);
    component.setupForm.confirmPassword().value.set(VALID_PASSWORD);
    component.setupForm.setupCode().value.set(' ABCD-EFGH-JKMN-PQRS ');
  }

  beforeEach(async () => {
    const SetupServiceMock: Partial<Mocked<SetupService>> = {
      createFirstAdmin: vi.fn<SetupService['createFirstAdmin']>().mockReturnValue(of(undefined))
    };

    const AuthServiceMock: Partial<Mocked<AuthService>> = {
      get loginRoute() { return "user-select"; }
    };

    const NotificationServiceMock: Partial<Mocked<NotificationService>> = {
      success: vi.fn<NotificationService['success']>()
    };

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: SetupService, useValue: SetupServiceMock },
        { provide: AuthService, useValue: AuthServiceMock },
        { provide: NotificationService, useValue: NotificationServiceMock }
      ],
      imports: [
        RouterModule.forRoot([{ path: 'user-select', component: BlankComponent }]),
        BlankComponent
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SetupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    setupService = TestBed.inject(SetupService) as Mocked<SetupService>;
    notificationService = TestBed.inject(NotificationService) as Mocked<NotificationService>;
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
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
    expect(setupService.createFirstAdmin).toHaveBeenCalledWith({
      userName: 'jtkirk',
      emailAddress: 'jtkirk@ufp.org',
      password: VALID_PASSWORD,
      setupCode: 'ABCD-EFGH-JKMN-PQRS'
    });
    expect(notificationService.success).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['user-select']);
    expect(component.creatingAdministrator()).toBe(false);
  });

  it('should stay on the page when the API rejects the request', async () => {
    //ARRANGE
    setupService.createFirstAdmin.mockReturnValue(throwError(() => new Error('Bad request')));
    fillInValidForm();

    //ACT
    component.createAdministrator();
    await fixture.whenStable();

    //ASSERT
    expect(notificationService.success).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.creatingAdministrator()).toBe(false);
  });

  it('should not submit an invalid form', async () => {
    //ACT
    component.createAdministrator();
    await fixture.whenStable();

    //ASSERT
    expect(setupService.createFirstAdmin).not.toHaveBeenCalled();
  });
});
