import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '../../core/_models/user';
import { UserNewDTO } from '../../core/_models/user-new-dto';
import { UserService } from '../../core/_services/user/user.service';
import { of } from 'rxjs';

import { UserAddComponent } from './user-add.component';
import { AuthService } from '../../core/_services/auth/auth.service';

class MockUserService {
  addNew = vi.fn().mockReturnValue(of(new User()));
}

class MockAuthService {
  isUserLoggedIn = true;
}

@Component({
  selector: 'wt-blank',
  template: '',
  imports: [ReactiveFormsModule]
})
class BlankComponent {
}

describe('UserAddComponent', () => {
  let component: UserAddComponent;
  let fixture: ComponentFixture<UserAddComponent>;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterModule.forRoot([{ path: 'admin/users', component: BlankComponent }]),
        UserAddComponent, BlankComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: ActivatedRoute,
          useValue: {
            routeConfig: {
              path: '/user/register'
            }
          }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserAddComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add user', () => {

    //ARRANGE
    const expectedUser = new UserNewDTO();
    expectedUser.userName = "NewUser";
    expectedUser.emailAddress = "newuser@workouttracker.com";
    expectedUser.password = "gargargar123";
    expectedUser.role = 1;

    component.userAddForm.controls.name.setValue(expectedUser.userName);
    component.userAddForm.controls.emailAddress.setValue(expectedUser.emailAddress);
    component.userAddForm.controls.password.setValue(expectedUser.password);
    component.userAddForm.controls.confirmPassword.setValue(expectedUser.password);
    component.userAddForm.controls.role.setValue(expectedUser.role);

    //ACT
    component.addUser();

    //ASSERT
    expect(userService.addNew).toHaveBeenCalledWith(expectedUser);
    expect(router.navigate).toHaveBeenCalledWith(['admin/users']);
  });

  //TODO: Revisit! Having a hard time overriding that routeConfig!
  it.skip('should allow the user to cancel adding a new user in admin mode', () => {

    //ARRANGE
    //Need to override default activated route and re-init for this one
    const activatedRoute = TestBed.inject(ActivatedRoute);
    vi.spyOn(activatedRoute, "routeConfig", "get").mockReturnValue({ path: '/users/add' });

    //ACT
    component.ngOnInit();
    component.cancel();

    //ASSERT
    expect(router.navigate).toHaveBeenCalledWith(['/admin/users']);

  });

  it('should allow the user to cancel adding a new user in non-admin mode', () => {

    //ACT
    component.cancel();

    //ASSERT
    expect(router.navigate).toHaveBeenCalledWith(['/']);

  });

  it('should abort cancellation when form is dirty and user presses cancel on confirm dialog', () => {

    //ARRANGE
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.userAddForm.controls.name.setValue("Jane");
    component.userAddForm.controls.name.markAsDirty(); //Controls are only marked as dirty if changed via the UI

    //ACT
    component.cancel();

    //ASSERT
    expect(router.navigate).not.toHaveBeenCalled();

  });

});
