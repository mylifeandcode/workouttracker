import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from 'app/core/models/user';
import { UserNewDTO } from 'app/core/models/user-new-dto';
import { UserService } from 'app/core/user.service';
import { of } from 'rxjs';

import { UserAddComponent } from './user-add.component';

class UserServiceMock {
  addNew = jasmine.createSpy('addNew').and.returnValue(of(new User()));
}

@Component({
  selector: 'blank',
  template: ''
})
class BlankComponent {}

describe('UserAddComponent', () => {
  let component: UserAddComponent;
  let fixture: ComponentFixture<UserAddComponent>;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAddComponent, BlankComponent ],
      imports: [ 
        RouterTestingModule, 
        ReactiveFormsModule, 
        RouterTestingModule.withRoutes([ { path: 'admin/users', component: BlankComponent } ])
      ],
      providers: [
        {
          provide: UserService,
          useClass: UserServiceMock
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
    spyOn(router, 'navigate');
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
  xit('should allow the user to cancel adding a new user in admin mode', () => {

    //ARRANGE
    //Need to override default activated route and re-init for this one
    const activatedRoute = TestBed.inject(ActivatedRoute);
    spyOnProperty(activatedRoute, "routeConfig", "get").and.returnValue({ path: '/users/add' });

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
    spyOn(window, 'confirm').and.returnValue(false);
    component.userAddForm.controls.name.setValue("Jane");
    component.userAddForm.controls.name.markAsDirty(); //Controls are only marked as dirty if changed via the UI

    //ACT
    component.cancel();

    //ASSERT
    expect(router.navigate).not.toHaveBeenCalled();

  });

});
