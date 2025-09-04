import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { ConfigService } from 'app/core/_services/config/config.service';

import { ForgotPasswordComponent } from './forgot-password.component';

class AuthServiceMock {}
class ConfigServiceMock {
  get = jasmine.createSpy('get').and.returnValue(true);
}

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        FormBuilder,
        {
          provide: AuthService,
          useClass: AuthServiceMock
        },
        {
          provide: ConfigService,
          useClass: ConfigServiceMock
        },
        provideZonelessChangeDetection()
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
    expect(component.smtpEnabled()).toBeTrue();
  });
});
