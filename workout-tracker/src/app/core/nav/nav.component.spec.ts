import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { AuthService } from '../../core/_services/auth/auth.service';
import { RouterModule } from '@angular/router';

const username = 'someuser';

@Component({
  template: ''
})
class FakeComponent {
}
;

describe('NavComponent', () => {
    let component: NavComponent;
    let fixture: ComponentFixture<NavComponent>;

    beforeEach(async () => {
        const AuthServiceMock = {
            currentUserName: signal<string | null>('someuser'),
            logOut: vi.fn()
        } satisfies Partial<AuthService>;

        await TestBed.configureTestingModule({
            imports: [
                RouterModule.forRoot([{ path: 'admin/users', component: FakeComponent }]),
                NavComponent
            ],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: AuthService,
                    useValue: AuthServiceMock
                }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should determine if user is logged in', () => {

        //ARRANGE
        //Nothing else to do here

        //ACT
        //Nothing else to do here

        //ASSERT
        expect(component.userIsLoggedIn).toBeTruthy();

    });

    //TODO: Fix!
    it.skip('should get current user info', () => {

        //ASSERT
        expect(component.userName).toBe(username);

    });

});
