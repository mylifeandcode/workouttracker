import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from 'app/core/user.service';

import { UserSelectNewComponent } from './user-select-new.component';

class MockUserService {}

describe('UserSelectNewComponent', () => {
  let component: UserSelectNewComponent;
  let fixture: ComponentFixture<UserSelectNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSelectNewComponent ], 
      providers: [
        FormBuilder, 
        {
          provide: UserService,
          useClass: MockUserService
        }
      ], 
      imports: [ RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSelectNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
