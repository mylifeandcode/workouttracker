import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/core/services/auth/auth.service';

import { ChangePasswordComponent } from './change-password.component';
import { RouterModule } from '@angular/router';

class AuthServiceMock {}

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RouterModule.forRoot([]), ReactiveFormsModule ],
      declarations: [ ChangePasswordComponent ],
      providers: [
        FormBuilder,
        {
          provide: AuthService,
          useClass: AuthServiceMock
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
