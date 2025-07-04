import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';

class AuthServiceMock {
  public get loginRoute(): string {
    return "login";
  }

  logIn = jasmine.createSpy('logIn').and.returnValue(of(true));
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {
          provide: AuthService,
          useClass: AuthServiceMock
        }
      ],
      imports: [RouterModule.forRoot([]), ReactiveFormsModule, LoginComponent]
    })
      .overrideComponent(
        LoginComponent, {
        remove: { imports: [NzSpinModule] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    const username = "SomeUser";
    const password = "SomePassword123#$%^";

    fixture.detectChanges();

    component.loginForm.controls.username.setValue(username);
    component.loginForm.controls.password.setValue(password);
    spyOn(router, 'navigate');

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login a user', () => {

    //ARRANGE

    //ACT
    component.login();

    //ASSERT
    expect(router.navigate).toHaveBeenCalledWith(['home']);
    expect(component.showLoginFailed).toBeFalse();
    expect(component.loggingIn).toBeFalse();

  });

  it('should show login failed message when login fails', () => {

    //ARRANGE
    //Overide default mock implementation
    const authService = TestBed.inject(AuthService);
    authService.logIn = jasmine.createSpy('logIn').and.returnValue(of(false));

    //ACT
    component.login();

    //ASSERT
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.showLoginFailed).toBeTrue();
    expect(component.loggingIn).toBeFalse();

  });

});
