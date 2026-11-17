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

    beforeEach(async () => {
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            requestPasswordReset: vi.fn<AuthService['requestPasswordReset']>().mockReturnValue(of(undefined))
        };
        const ConfigServiceMock: Partial<Mocked<ConfigService>> = {
            get: vi.fn<ConfigService['get']>().mockReturnValue(true)
        };

        await TestBed.configureTestingModule({
            imports: [ForgotPasswordComponent],
            providers: [
                {
                    provide: AuthService,
                    useValue: AuthServiceMock
                },
                {
                    provide: ConfigService,
                    useValue: ConfigServiceMock
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set smtp enabled from config on init', () => {
        const configService = TestBed.inject(ConfigService);
        expect(configService.get).toHaveBeenCalledWith('smtpEnabled');
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
        const authService = TestBed.inject(AuthService);
        component.forgotPasswordForm.emailAddress().value.set('user@example.com');

        //ACT
        component.submitPasswordResetRequest();
        await fixture.whenStable(); //submit() runs its action asynchronously
        fixture.detectChanges();

        //ASSERT: the API answers the same way for every address, so the page can only claim an email "if an account exists".
        expect(authService.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
        expect(component.requestSuccessful()).toBe(true);
        expect((fixture.nativeElement as HTMLElement).textContent).toContain('If an account exists for that address');
    });
});
