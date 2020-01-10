import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListComponent } from './user-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../user.service';
import { of } from 'rxjs';
import { User } from 'app/models/user';

class UserServiceMock {
  private fakeUsers: User[] = 
  [
    new User({name: 'Fred'}), 
    new User({name: 'Joe'})
  ];

  getAll = jasmine.createSpy('getAll').and.returnValue(of(this.fakeUsers));
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User()));
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
});
