import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/_services/user/user.service';
import { of, throwError } from 'rxjs';
import { User } from '../../api';
import { RouterModule } from '@angular/router';
import { type Mocked } from 'vitest';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: Mocked<UserService>;

  beforeEach(async () => {
    const fakeUsers: User[] = [
      <User>{ id: 1, name: 'Fred', isActive: true },
      <User>{ id: 2, name: 'Joe', isActive: true },
      <User>{ id: 3, name: 'Paul', isActive: false }
    ];
    const UserServiceMock: Partial<Mocked<UserService>> = {
      getAll: vi.fn<UserService['getAll']>().mockReturnValue(of(fakeUsers)),
      deactivate: vi.fn<UserService['deactivate']>().mockReturnValue(of(undefined)),
      reactivate: vi.fn<UserService['reactivate']>().mockReturnValue(of(undefined)),
      all$: of(fakeUsers)
    };

    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), UserListComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: UserService,
          useValue: UserServiceMock
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    userService = TestBed.inject(UserService) as Mocked<UserService>;
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
    expect(userService.deactivate).not.toHaveBeenCalled();
  });

  it('should deactivate a user when the confirm dialog returns true', () => {
    //ARRANGE
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    //ACT
    component.deactivateUser('2');

    //ASSERT
    expect(userService.deactivate).toHaveBeenCalledWith('2');
    expect(component.busy()).toBe(false);
  });

  it('should reactivate a user without asking for confirmation', () => {
    //ARRANGE
    const confirm = vi.spyOn(window, 'confirm');
    confirm.mockClear(); //The spy outlives the test that created it, so drop calls recorded by earlier tests.

    //ACT
    component.reactivateUser('3');

    //ASSERT
    expect(userService.reactivate).toHaveBeenCalledWith('3');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('should show the API explanation when a user cannot be deactivated', async () => {
    //ARRANGE
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const refusal = new HttpErrorResponse({
      status: 409,
      error: { status: 409, detail: "You can't deactivate your own account." }
    });
    userService.deactivate.mockReturnValue(throwError(() => refusal));

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
