import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';

class AuthServiceMock {
  logOut = jasmine.createSpy('logOut');
  public get loginRoute(): string {
    return "login";
  }
}

@Component({
    standalone: false
})
class FakeComponent {}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        RouterModule.forRoot([{ path: 'login', component: FakeComponent }]),
        HomeComponent
    ],
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
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should allow user to log off', () => {

    //ARRANGE
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);

    spyOn(router, 'navigate').and.callThrough();

    //ACT
    component.logOff();

    //ASSERT
    expect(authService.logOut).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['login']);

  });

});
