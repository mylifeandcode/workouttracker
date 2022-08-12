import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserListComponent } from './user-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../core/user.service';
import { of } from 'rxjs';
import { User } from 'app/core/models/user';

class UserServiceMock {
  private fakeUsers: User[] =
  [
    new User({id: 1, name: 'Fred'}),
    new User({id: 2, name: 'Joe'}), 
    new User({id: 3, name: 'Paul'})
  ];

  getAll = jasmine.createSpy('getAll').and.returnValue(of(this.fakeUsers));
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User()));
  delete = jasmine.createSpy('delete').and.returnValue(of(null)); //TOOD: Revisit
  all$ = of(this.fakeUsers);
}

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: UserService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        {
          provide: UserService,
          useClass: UserServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    userService = TestBed.inject(UserService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //Removed. Using async pipe with Observable on service now.
  /*
  it('should load users on init', () => {
    expect(userService.getAll).toHaveBeenCalledTimes(1);
    expect(component?.users?.length).toBeGreaterThan(0);
  });
  */

  it('should prevent deleting user if user confirm dialog returns false', () => {
    //ARRANGE
    spyOn(window, 'confirm').and.returnValue(false);

    //ACT
    component.deleteUser(1);

    //ASSERT
    expect(userService.delete).not.toHaveBeenCalled();
  });

  it('should call service to delete user when confirm dialog returns true', () => {
    //ARRANGE
    spyOn(window, 'confirm').and.returnValue(true);
 
    //ACT
    component.deleteUser(2);

    //ASSERT
    expect(userService.delete).toHaveBeenCalledWith(2);
  });

  //Removed. Using async pipe with Observable on service now.
  /*
  it('should remove deleted user from users array when user is deleted', () => {
    //ARRANGE
    spyOn(window, 'confirm').and.returnValue(true);

    //ACT
    component.deleteUser(2);

    //ASSERT
    expect(component?.users?.length).toBe(2);
    if(component?.users != null) {
      expect(component?.users[0].id).toBe(1);
      expect(component?.users[1].id).toBe(3);
    }
    else
      fail("component or component.users is null.");
  });
  */
});
