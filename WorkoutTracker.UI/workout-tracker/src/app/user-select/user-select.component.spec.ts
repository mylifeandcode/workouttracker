import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectComponent } from './user-select.component';
import { UserService } from '../core/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { User } from 'app/core/models/user';

class UserServiceMock {
  getCurrentUserInfo = jasmine.createSpy('getCurrentUserInfo').and.returnValue(of(new User()));
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new Array<User>()));
}

describe('UserSelectComponent', () => {
  let component: UserSelectComponent;
  let fixture: ComponentFixture<UserSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSelectComponent ], 
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
    fixture = TestBed.createComponent(UserSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
