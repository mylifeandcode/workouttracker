import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { Component, provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { RouterModule } from '@angular/router';

const username = 'someuser';

class AuthServiceMock {

  currentUserName: WritableSignal<string | null> = signal('someuser');

  logOff = jasmine.createSpy('logOff');

}

@Component({
})
class FakeComponent { };

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: 'admin/users', component: FakeComponent }]),
        NavComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: AuthService,
          useClass: AuthServiceMock
        }
      ]
    })
      .compileComponents();
  });

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
    //Nothing else to do here

    //ACT
    //Nothing else to do here

    //ASSERT
    expect(component.userIsLoggedIn).toBeTruthy();

  });

  //TODO: Fix!
  xit('should get current user info', () => {

    //ASSERT
    expect(component.userName).toBe(username);

  });

});
