import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';
import { CookieService } from 'ng2-cookies';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class CookieServiceMock {

}

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService, 
        {
          provide: CookieService, 
          useClass: CookieServiceMock
        }
      ], 
      imports :[
        HttpClientTestingModule
      ]      
    });
  });

  it('should be creatable', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
