import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { AuthService } from '../../core/_services/auth/auth.service';
import { provideRouter } from '@angular/router';
import { type Mocked } from 'vitest';

const username = 'someuser';

describe('NavComponent', () => {
    let component: NavComponent;
    let fixture: ComponentFixture<NavComponent>;

    //currentUserName is a signal, which Mocked<> would turn into a MockInstance, so only logOut gets the mock type.
    const authServiceMock: Pick<AuthService, 'currentUserName'> & Mocked<Pick<AuthService, 'logOut'>> = {
        currentUserName: signal<string | null>('someuser'),
        logOut: vi.fn<AuthService['logOut']>().mockName('logOut')
    };

    beforeEach(async () => {
        //resetAllMocks() only resets the vi.fn()s, so put the signal back to its starting value for every test.
        authServiceMock.currentUserName.set('someuser');

        await TestBed.configureTestingModule({
            imports: [
                NavComponent
            ],
            providers: [
                provideRouter([]),
                provideZonelessChangeDetection(),
                {
                    provide: AuthService,
                    useValue: authServiceMock
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

    afterEach(() => {
        vi.resetAllMocks();
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
