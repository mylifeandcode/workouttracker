import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from 'app/core/user.service';

import { UserAddComponent } from './user-add.component';

class UserServiceMock {}

describe('UserAddComponent', () => {
  let component: UserAddComponent;
  let fixture: ComponentFixture<UserAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAddComponent ],
      imports: [ RouterTestingModule, ReactiveFormsModule ],
      providers: [
        {
          provide: UserService,
          useClass: UserServiceMock
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
