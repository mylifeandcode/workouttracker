import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { of } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

class AuthServiceMock {
  validatePasswordResetCode = 
    jasmine.createSpy('validatePasswordResetCode ').and.returnValue(of(true));
}

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterModule.forRoot([]), ReactiveFormsModule, ResetPasswordComponent],
  providers: [
        FormBuilder,
        {
            provide: AuthService,
            useClass: AuthServiceMock
        },
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: of({
                        resetCode: 'gar145'
                    })
                }
            }
    },
    provideZonelessChangeDetection()
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
    .overrideComponent(
      ResetPasswordComponent, {
        remove: { imports: [ NzSpinModule ] },
        add: { schemas: [ CUSTOM_ELEMENTS_SCHEMA ] }
      })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
