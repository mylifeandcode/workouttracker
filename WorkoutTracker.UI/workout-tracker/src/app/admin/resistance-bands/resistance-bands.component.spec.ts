import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UserService } from 'app/core/user.service';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ResistanceBandService } from './resistance-band.service';

import { ResistanceBandsComponent } from './resistance-bands.component';

const TEST_USER_ID: number = 1;

class ResistanceBandServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(new Array<ResistanceBand>()));
  add = jasmine.createSpy('add').and.returnValue(of(new ResistanceBand()));
  update = jasmine.createSpy('update').and.returnValue(of(new ResistanceBand()));
  delete = jasmine.createSpy('delete').and.returnValue(of(new HttpResponse<string>()));
}

class UserServiceMock {
  currentUserId = jasmine.createSpy('currentUserId').and.returnValue(TEST_USER_ID);
}

class MessageServiceMock {
  add = jasmine.createSpy('add');
}

class ConfirmationServiceMock {
  confirm = jasmine.createSpy('confirm').and.returnValue(this);
}


describe('ResistanceBandsComponent', () => {
  let component: ResistanceBandsComponent;
  let fixture: ComponentFixture<ResistanceBandsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResistanceBandsComponent ], 
      providers: [
        {
          provide: ResistanceBandService, 
          useClass: ResistanceBandServiceMock
        }, 
        {
          provide: UserService, 
          useClass: UserServiceMock
        }, 
        {
          provide: MessageService, 
          useClass: MessageServiceMock
        }, 
        {
          provide: ConfirmationService, 
          useClass: ConfirmationServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResistanceBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
