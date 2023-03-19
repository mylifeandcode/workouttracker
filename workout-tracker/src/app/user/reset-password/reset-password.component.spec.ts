import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'app/core/auth.service';
import { of } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';

class AuthServiceMock {
  validatePasswordResetCode = 
    jasmine.createSpy('validatePasswordResetCode ').and.returnValue(of(true));
}

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ReactiveFormsModule ],
      declarations: [ ResetPasswordComponent ],
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
        }
      ]
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
