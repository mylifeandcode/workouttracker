import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
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

class MessageServiceMock {
  add = jasmine.createSpy('add');
}

class ConfirmationServiceMock {
  confirm =
    jasmine.createSpy('confirm')
      .and.callFake((confirmation: Confirmation) => { confirmation.accept(); });
      //.and.returnValue(this);
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

  it('should get resistance band data on init', () => {
    const resistanceBandService: ResistanceBandService = TestBed.inject(ResistanceBandService);
    expect(resistanceBandService.getAll).toHaveBeenCalled();
    expect(component.resistanceBands).not.toBeNull();
  })

  it('should add resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(MessageService);
    component.openAddModal();

    //ACT
    component.saveNewBand();

    //ASSERT
    expect(resistanceBandService.add).toHaveBeenCalledWith(component.newResistanceBand);
    expect(messageService.add)
      .toHaveBeenCalledWith({
        severity:'success',
        summary: 'Successful',
        detail: 'Resistance Band added', life: 3000
      });
    expect(resistanceBandService.getAll).toHaveBeenCalledTimes(2); //The initial call and then the refrsh after the save

  });

  it('should update resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(MessageService);
    const band = new ResistanceBand();

    //ACT
    component.onRowEditSave(band);

    //ASSERT
    expect(resistanceBandService.update).toHaveBeenCalledWith(band);
    expect(messageService.add)
      .toHaveBeenCalledWith({
        severity:'success',
        summary: 'Successful',
        detail: 'Resistance Band updated', life: 3000
      });

  });

  it('should delete resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(MessageService);
    const confirmationService = TestBed.inject(ConfirmationService);
    const band = new ResistanceBand();
    band.id = 5;

    //ACT
    component.deleteBand(band);

    //ASSERT
    expect(resistanceBandService.delete).toHaveBeenCalledWith(band.id);
    expect(messageService.add)
      .toHaveBeenCalledWith({
        severity:'success',
        summary: 'Successful',
        detail: 'Resistance Band deleted', life: 3000
      });
    expect(resistanceBandService.getAll).toHaveBeenCalledTimes(2); //The initial call and then the refresh after deletion

  });

  it('should not delete resistance band if user does not confirm', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(MessageService);
    const confirmationService = TestBed.inject(ConfirmationService);
    confirmationService.confirm = jasmine.createSpy('confirm').and.callFake(() => {});
    const band = new ResistanceBand();
    band.id = 5;

    //ACT
    component.deleteBand(band);

    //ASSERT
    expect(resistanceBandService.delete).not.toHaveBeenCalled();
    expect(messageService.add).not.toHaveBeenCalled();
    expect(resistanceBandService.getAll).toHaveBeenCalledTimes(1); //Just the initial call

  });

  it('should open modal', () => {

    //ACT
    component.openAddModal();

    //ASSERT
    expect(component.newResistanceBand).not.toBeNull();
    expect(component.modalSubmitted).toBeFalse();
    expect(component.showAddDialog).toBeTrue();

  })

  it('should hide modal', () => {

    //ACT
    component.hideModal();

    //ASSERT
    expect(component.showAddDialog).toBeFalse();
    expect(component.modalSubmitted).toBeFalse();

  });

});
