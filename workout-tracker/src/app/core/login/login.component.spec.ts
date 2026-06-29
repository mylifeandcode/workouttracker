import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/_services/auth/auth.service';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { type Mocked } from 'vitest';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let router: Router;

    beforeEach(async () => {
        const AuthServiceMock: Partial<Mocked<AuthService>> = {
            get loginRoute() { return "login"; },
            logIn: vi.fn<AuthService['logIn']>().mockReturnValue(of(true))
        };

        await TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: AuthService,
                    useValue: AuthServiceMock
                }
            ],
            imports: [RouterModule.forRoot([]), LoginComponent]
        })
            .overrideComponent(LoginComponent, {
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

        component.loginForm.username().value.set(username);
        component.loginForm.password().value.set(password);
        vi.spyOn(router, 'navigate');

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize signals with default values', () => {
        expect(component.loggingIn()).toBe(false);
        expect(component.showLoginFailed()).toBe(false);
    });

    it('should login a user', async () => {
        //ARRANGE

        //ACT
        component.login();
        await fixture.whenStable(); //submit() runs its action asynchronously

        //ASSERT
        expect(router.navigate).toHaveBeenCalledWith(['home']);
        expect(component.showLoginFailed()).toBe(false);
        expect(component.loggingIn()).toBe(false);
    });

    it('should show login failed message when login fails', async () => {
        //ARRANGE
        //Overide default mock implementation
        const authService = TestBed.inject(AuthService);
        authService.logIn = vi.fn<AuthService['logIn']>().mockReturnValue(of(false));

        //ACT
        component.login();
        await fixture.whenStable();

        //ASSERT
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.showLoginFailed()).toBe(true);
        expect(component.loggingIn()).toBe(false);
    });
});
