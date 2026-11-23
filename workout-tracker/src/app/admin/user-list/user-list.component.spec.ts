import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/_services/user/user.service';
import { of, throwError } from 'rxjs';
import { User } from '../../api';
import { provideRouter } from '@angular/router';
import { type Mocked } from 'vitest';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  const fakeUsers: User[] = [
    <User>{ id: 1, name: 'Fred', isActive: true },
    <User>{ id: 2, name: 'Joe', isActive: true },
    <User>{ id: 3, name: 'Paul', isActive: false }
  ];
  const userServiceMock: Mocked<Pick<UserService, 'getAll' | 'deactivate' | 'reactivate' | 'all$'>> = {
    getAll: vi.fn<UserService['getAll']>(() => of(fakeUsers)).mockName('getAll'),
    deactivate: vi.fn<UserService['deactivate']>(() => of(undefined)).mockName('deactivate'),
    reactivate: vi.fn<UserService['reactivate']>(() => of(undefined)).mockName('reactivate'),
    all$: of(fakeUsers)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: UserService,
          useValue: userServiceMock
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks(); //Undoes the window.confirm spies
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should offer Deactivate for an active user and Reactivate for an inactive one', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr'))
      .map(row => Array.from(row.querySelectorAll('button')).map(b => b.textContent?.trim()));

    expect(buttons[0]).toContain('Deactivate');
    expect(buttons[2]).toContain('Reactivate');
    expect(buttons[2]).not.toContain('Deactivate');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Inactive');
  });

  it('should not deactivate a user if the confirm dialog returns false', () => {
    //ARRANGE
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    //ACT
    component.deactivateUser('1');

    //ASSERT
    expect(userServiceMock.deactivate).not.toHaveBeenCalled();
  });

  it('should deactivate a user when the confirm dialog returns true', () => {
    //ARRANGE
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    //ACT
    component.deactivateUser('2');

    //ASSERT
    expect(userServiceMock.deactivate).toHaveBeenCalledWith('2');
    expect(component.busy()).toBe(false);
  });

  it('should reactivate a user without asking for confirmation', () => {
    //ARRANGE
    const confirm = vi.spyOn(window, 'confirm');

    //ACT
    component.reactivateUser('3');

    //ASSERT
    expect(userServiceMock.reactivate).toHaveBeenCalledWith('3');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('should show the API explanation when a user cannot be deactivated', async () => {
    //ARRANGE
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const refusal = new HttpErrorResponse({
      status: 409,
      error: { status: 409, detail: "You can't deactivate your own account." }
    });
    userServiceMock.deactivate.mockReturnValue(throwError(() => refusal));

    //ACT
    component.deactivateUser('1');
    await fixture.whenStable();
    fixture.detectChanges();

    //ASSERT
    expect(component.errorMsg()).toBe("You can't deactivate your own account.");
    expect((fixture.nativeElement as HTMLElement).textContent).toContain("You can't deactivate your own account.");
    expect(component.busy()).toBe(false);
  });
});
