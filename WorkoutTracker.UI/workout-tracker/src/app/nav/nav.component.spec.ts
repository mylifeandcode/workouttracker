import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavComponent } from './nav.component';
import { UserService } from 'app/core/user.service';
import { of } from 'rxjs';
import { User } from 'app/core/models/user';
import { Component } from '@angular/core';

const username = 'someuser';

class UserServiceMock {

  currentUserInfo = 
    of(new User({name: username}));

}

@Component({})
class FakeComponent{};

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [        
        RouterTestingModule.withRoutes(
          [{path: 'admin/users', component: FakeComponent}])
      ],
      declarations: [ NavComponent ], 
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
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should determine if user is logged in', () => {
    
    //ARRANGE
    const userService = TestBed.inject(UserService);

    //ACT
    //Nothing else to do here

    //ASSERT
    expect(component.userIsLoggedIn).toBeTruthy();

  });

  it('should get current user info', () => {

    //ARRANGE
    const userService = TestBed.inject(UserService);

    //ACT
    //Nothing extra needed here

    //ASSERT
    expect(component.userName = username);

  });
  
});
