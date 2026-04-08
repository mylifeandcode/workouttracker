import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { of } from 'rxjs';
import { vi, type Mocked } from 'vitest';

import { ResetPasswordComponent } from './reset-password.component';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;

    beforeEach(async () => {
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            validatePasswordResetCode: vi.fn().mockReturnValue(of(true))
        };

        await TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([]), ReactiveFormsModule, ResetPasswordComponent],
            providers: [
                FormBuilder,
                {
                    provide: AuthService,
                    useValue: AuthServiceMock
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                resetCode: 'gar145'
                            }
                        }
                    }
                },
                provideZonelessChangeDetection()
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .overrideComponent(ResetPasswordComponent, {
            remove: { imports: [NzSpinModule] },
            add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
        })
            .compileComponents();

        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should validate reset code on init', () => {
        const authService = TestBed.inject(AuthService);
        expect(authService.validatePasswordResetCode).toHaveBeenCalledWith('gar145');
        expect(component.validatingResetCode()).toBe(false);
        expect(component.resetCodeInvalid()).toBe(false);
    });
});
