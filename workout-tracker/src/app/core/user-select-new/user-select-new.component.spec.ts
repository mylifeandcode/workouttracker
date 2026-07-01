import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { User, UserNewDTO } from '../../api';
import { UserService } from '../../core/_services/user/user.service';
import { of } from 'rxjs';
import { type Mocked } from 'vitest';

import { UserSelectNewComponent } from './user-select-new.component';

@Component({
  selector: 'wt-blank',
  template: ''
})
class BlankComponent {
}

describe('UserSelectNewComponent', () => {
  let component: UserSelectNewComponent;
  let fixture: ComponentFixture<UserSelectNewComponent>;
  let router: Router;

  beforeEach(async () => {
    const UserServiceMock: Partial<Mocked<UserService>> = {
      addNew: vi.fn<UserService['addNew']>().mockReturnValue(of(<User>{}))
    };

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: UserService,
          useValue: UserServiceMock
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
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form', () => {
    expect(component.newUserForm).toBeTruthy();
    expect(component.newUserForm.emailAddress).toBeTruthy();
    expect(component.newUserForm.name).toBeTruthy();
  });

  it('should initialize signals with default values', () => {
    expect(component.errorMsg()).toBeUndefined();
    expect(component.addingUser()).toBe(false);
  });

  it('should add a user', async () => {
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const userName = "jtkirk";
    const emailAddress = "jtkirk@ufp.org";
    const expectedUser = <UserNewDTO>{};

    expectedUser.userName = userName;
    expectedUser.emailAddress = emailAddress;
    expectedUser.password = "No Password. User-select mode!";

    component.newUserForm.name().value.set(userName);
    component.newUserForm.emailAddress().value.set(emailAddress);

    //ACT
    component.addUser();
    await fixture.whenStable(); //submit() runs its action asynchronously

    //ASSERT
    expect(userService.addNew).toHaveBeenCalledWith(expectedUser);
    expect(router.navigate).toHaveBeenCalledWith(['/user-select']);
  });

});
