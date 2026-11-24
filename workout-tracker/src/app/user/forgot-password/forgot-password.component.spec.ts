import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { ConfigService } from '../../core/_services/config/config.service';
import { of } from 'rxjs';
import { type Mocked } from 'vitest';

import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;

    const authServiceMock: Mocked<Pick<AuthService, 'requestPasswordReset'>> = {
        requestPasswordReset: vi.fn<AuthService['requestPasswordReset']>(() => of(undefined)).mockName('requestPasswordReset')
    };
    const configServiceMock: Mocked<Pick<ConfigService, 'get'>> = {
        get: vi.fn<ConfigService['get']>(() => true).mockName('get')
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ForgotPasswordComponent],
            providers: [
                {
                    provide: AuthService,
                    useValue: authServiceMock
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock
                },
                provideZonelessChangeDetection(),
                provideRouter([])
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set smtp enabled from config on init', () => {
        expect(configServiceMock.get).toHaveBeenCalledWith('smtpEnabled');
        expect(component.smtpEnabled()).toBe(true);
    });

    it('should be invalid when the email address is empty', () => {
        expect(component.forgotPasswordForm().invalid()).toBe(true);
    });

    it('should be invalid when the email address is not a valid email', () => {
        component.forgotPasswordForm.emailAddress().value.set('not-an-email');
        expect(component.forgotPasswordForm().invalid()).toBe(true);
    });

    it('should be valid when a well-formed email address is entered', () => {
        component.forgotPasswordForm.emailAddress().value.set('user@example.com');
        expect(component.forgotPasswordForm().valid()).toBe(true);
    });

    it('should submit the request and say only what is true whether or not the address has an account', async () => {
        //ARRANGE
        component.forgotPasswordForm.emailAddress().value.set('user@example.com');

        //ACT
        component.submitPasswordResetRequest();
        await fixture.whenStable(); //submit() runs its action asynchronously
        fixture.detectChanges();

        //ASSERT: the API answers the same way for every address, so the page can only claim an email "if an account exists".
        expect(authServiceMock.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
        expect(component.requestSuccessful()).toBe(true);
        expect((fixture.nativeElement as HTMLElement).textContent).toContain('If an account exists for that address');
    });
});
