import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavComponent } from './nav.component';
import { Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import { AuthService } from 'app/core/services/auth.service';

const username = 'someuser';

class AuthServiceMock {

  currentUserName: Observable<string> =
    of(username);

  logOff = jasmine.createSpy('logOff');
  
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
          provide: AuthService,
          useClass: AuthServiceMock
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
    const authService = TestBed.inject(AuthService);

    //ACT
    //Nothing else to do here

    //ASSERT
    expect(component.userIsLoggedIn).toBeTruthy();

  });

  it('should get current user info', () => {

    //ASSERT
    expect(component.userName).toBe(username);

  });

});
