import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from 'app/core/_models/user';
import { UserNewDTO } from 'app/core/_models/user-new-dto';
import { UserService } from 'app/core/_services/user/user.service';
import { of } from 'rxjs';

import { UserSelectNewComponent } from './user-select-new.component';

class MockUserService {
  addNew = jasmine.createSpy('addNew').and.returnValue(of(new User()));
}

@Component({
  selector: 'wt-blank',
  template: '',
  imports: [ReactiveFormsModule]
})
class BlankComponent { }

describe('UserSelectNewComponent', () => {
  let component: UserSelectNewComponent;
  let fixture: ComponentFixture<UserSelectNewComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {
          provide: UserService,
          useClass: MockUserService
        }
      ],
      imports: [
        RouterModule.forRoot([{ path: 'user-select', component: BlankComponent }]),
        BlankComponent
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserSelectNewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a FormGroup', () => {
    expect(component.newUserForm).not.toBeNull();
    expect(component.newUserForm.controls.emailAddress).not.toBeNull();
    expect(component.newUserForm.controls.name).not.toBeNull();
  });

  it('should add a user', () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const userName = "jtkirk";
    const emailAddress = "jtkirk@ufp.org";
    const expectedUser = new UserNewDTO();

    expectedUser.userName = userName;
    expectedUser.emailAddress = emailAddress;
    expectedUser.password = "No Password. User-select mode!";

    component.newUserForm.patchValue({
      name: userName,
      emailAddress
    });

    //ACT
    component.addUser();

    //ASSERT
    expect(userService.addNew).toHaveBeenCalledWith(expectedUser);
    expect(router.navigate).toHaveBeenCalledWith(['/user-select']);
  });
});
