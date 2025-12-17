import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditComponent } from './user-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../core/_services/user/user.service';
import { of, throwError } from 'rxjs';
import { User } from 'app/core/_models/user';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from 'app/core/_services/auth/auth.service';

const CURRENT_USER_ID = 5150;

class UserServiceMock {
    getCurrentUserInfo = vi.fn().mockReturnValue(of(new User({ id: CURRENT_USER_ID })));
    getById = vi.fn().mockReturnValue(of(new User()));
    add = vi.fn().mockReturnValue(of(new User()));
    update = vi.fn().mockReturnValue(of(new User()));
}

class AuthServiceMock {
}

@Component({
    standalone: false
})
class FakeComponent {
}
;

describe('UserEditComponent', () => {
    let component: UserEditComponent;
    let fixture: ComponentFixture<UserEditComponent>;
    let userService: UserService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                RouterModule.forRoot([{ path: 'admin/users', component: FakeComponent }]),
                UserEditComponent
            ],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: UserService,
                    useClass: UserServiceMock
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({
                            id: 5
                        })
                    }
                },
                {
                    provide: AuthService,
                    useClass: AuthServiceMock
                }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserEditComponent);
        component = fixture.componentInstance;
        userService = TestBed.inject(UserService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create the form', () => {
        expect(component.userEditForm).toBeTruthy();
        expect(component.userEditForm.controls.id).toBeTruthy();
        expect(component.userEditForm.controls.name).toBeTruthy();
    });

    it('should get user info when route specifies a user ID', () => {
        expect(userService.getById).toHaveBeenCalledTimes(1);
    });

    it('should update existing user', () => {
        //ARRANGE
        const expectedUser = new User({ id: 100, name: 'Big Jim Slade', role: 2 });
        component.userEditForm.controls.id.setValue(expectedUser.id);
        component.userEditForm.controls.name.setValue(expectedUser.name);
        component.userEditForm.controls.role.setValue(2);

        //ACT
        component.saveUser();

        //ASSERT
        expect(userService.update).toHaveBeenCalledWith(expectedUser);
    });

    it('should populate error message when error occurs while saving user info', () => {
        //ARRANGE
        userService.update = vi.fn().mockReturnValue(throwError(() => new Error("Something bad happened.")));
        component.userEditForm.controls.id.setValue(100);
        component.userEditForm.controls.name.setValue('Doug');

        //ACT
        component.saveUser();

        //ASSERT
        expect(userService.update).toHaveBeenCalled();
        expect(component.errorMsg()).toBe("Something bad happened.");
    });

    it('should populate error message when user does not have permissions to save user info', () => {
        //ARRANGE
        const error = { status: 403 };
        userService.update = vi.fn().mockReturnValue(throwError(() => error));
        component.userEditForm.controls.id.setValue(100);
        component.userEditForm.controls.name.setValue('Doug');

        //ACT
        component.saveUser();

        //ASSERT
        expect(userService.update).toHaveBeenCalled();
        expect(component.errorMsg()).toBe("You do not have permission to add or edit users.");
    });

});
