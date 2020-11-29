import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListComponent } from './user-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../core/user.service';
import { of } from 'rxjs';
import { User } from 'app/core/models/user';

class UserServiceMock {
  private fakeUsers: User[] = 
  [
    new User({name: 'Fred'}), 
    new User({name: 'Joe'})
  ];

  getAll = jasmine.createSpy('getAll').and.returnValue(of(this.fakeUsers));
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User()));
  deleteUser = jasmine.createSpy('deleteUser').and.returnValue(of(null)); //TOOD: Revisit
}

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async(() => {
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    fixture.detectChanges();
    const userSvc: UserService = TestBed.get(UserService);
    expect(userSvc.getAll).toHaveBeenCalledTimes(1);
    expect(component.users.length).toBeGreaterThan(0);
  });

  it('should prevent deleting user if user confirm dialog returns false', () => {
    //ARRANGE
    spyOn(window, 'confirm').and.returnValue(false);
    const userSvc: UserService = TestBed.get(UserService);

    //ACT
    fixture.detectChanges();
    component.deleteUser(1);
    
    //ASSERT
    expect(userSvc.deleteUser).not.toHaveBeenCalled();
  });
});
