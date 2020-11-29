import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { UserService } from 'app/core/user.service';
import { of } from 'rxjs';
import { User } from 'app/core/models/user';

class UserServiceMock {
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User()));
  isUserLoggedIn = jasmine.createSpy('isUserLoggedIn').and.returnValue(true);
}

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
});
