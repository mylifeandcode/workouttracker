import { TestBed, async, inject } from '@angular/core/testing';

import { UserSelectedGuard } from './user-selected.guard';
import { UserService } from 'app/core/user.service';
import { RouterTestingModule } from '@angular/router/testing';

class UserServiceMock {

}

describe('UserSelectedGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ], 
      providers: [
        UserSelectedGuard, 
        {
          provide: UserService, 
          useClass: UserServiceMock
        }
      ]
    });
  });

  it('should ...', inject([UserSelectedGuard], (guard: UserSelectedGuard) => {
    expect(guard).toBeTruthy();
  }));
});
