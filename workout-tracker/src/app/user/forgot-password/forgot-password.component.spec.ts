import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from 'app/core/_services/auth/auth.service';

import { ForgotPasswordComponent } from './forgot-password.component';

class AuthServiceMock {}

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
});
