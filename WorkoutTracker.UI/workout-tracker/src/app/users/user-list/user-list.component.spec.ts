import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListComponent } from './user-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../user.service';
import { of } from 'rxjs';
import { User } from 'app/models/user';

class UserServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new Array<User>()));
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
});
