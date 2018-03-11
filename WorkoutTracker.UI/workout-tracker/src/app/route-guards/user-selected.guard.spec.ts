import { TestBed, async, inject } from '@angular/core/testing';

import { UserSelectedGuard } from './user-selected.guard';

describe('UserSelectedGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserSelectedGuard]
    });
  });

  it('should ...', inject([UserSelectedGuard], (guard: UserSelectedGuard) => {
    expect(guard).toBeTruthy();
  }));
});
