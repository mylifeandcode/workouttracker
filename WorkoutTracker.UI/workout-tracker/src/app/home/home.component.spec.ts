import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { UserService } from 'app/core/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

class UserServiceMock {
  logOff = jasmine.createSpy('logOff');
}

@Component({})
class FakeComponent {}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'login', component: FakeComponent}]
        )
      ], 
      declarations: [ HomeComponent ], 
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
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should allow user to log off', () => {
    
    //ARRANGE
    const userService = TestBed.inject(UserService);
    const router = TestBed.inject(Router);

    spyOn(router, 'navigate').and.callThrough();
    
    //ACT
    component.logOff();

    //ASSERT
    expect(userService.logOff).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['login']);
    
  });

});
