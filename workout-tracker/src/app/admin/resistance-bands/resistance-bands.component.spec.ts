import { HttpResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ResistanceBandService } from '../../shared/services/resistance-band.service';

import { ResistanceBandsComponent } from './resistance-bands.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgStyle } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

const getResistanceBandInventory = () => {
  const bands = new Array<ResistanceBand>();
  bands.push(<ResistanceBand>{ publicId: 'someGuid1', color: 'Blue', maxResistanceAmount: 26, numberAvailable: 2, id: 1 });
  bands.push(<ResistanceBand>{ publicId: 'someGuid2', color: 'Orange', maxResistanceAmount: 60, numberAvailable: 4, id: 2 });
  bands.push(<ResistanceBand>{ publicId: 'someGuid3', color: 'Yellow', maxResistanceAmount: 6, numberAvailable: 2, id: 3 });
  bands.push(<ResistanceBand>{ publicId: 'someGuid4', color: 'Onlyx', maxResistanceAmount: 80, numberAvailable: 5, id: 4 });
  return bands;
};

class ResistanceBandServiceMock {
  getAll = jasmine.createSpy('getAll').and.returnValue(of(getResistanceBandInventory()));
  add = jasmine.createSpy('add').and.returnValue(of(new ResistanceBand()));
  update = jasmine.createSpy('update').and.returnValue(of(new ResistanceBand()));
  deleteById = jasmine.createSpy('deleteById').and.returnValue(of(new HttpResponse<string>()));
}

class MessageServiceMock {
  add = jasmine.createSpy('add');
}

class ConfirmationServiceMock {
  confirm =
    jasmine.createSpy('confirm')
      .and.callFake((confirmation: Confirmation) => {
        confirmation?.accept?.(); //Because confirmation could be undefined
      });
  //.and.returnValue(this);
}

describe('ResistanceBandsComponent', () => {
  let component: ResistanceBandsComponent;
  let fixture: ComponentFixture<ResistanceBandsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ResistanceBandsComponent],
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
        },
        {
          provide: NzMessageService,
          useValue: jasmine.createSpyObj<NzMessageService>('NzMessageService', ['create'])
        },
        {
          provide: NzModalService,
          useValue: {
            confirm: jasmine.createSpy('confirm').and.callFake((options) => {
              // Simulate the user clicking "OK"
              if (options.nzOnOk) {
                const onOkResult = options.nzOnOk();
                if (onOkResult instanceof Promise) {
                  return onOkResult.then(() => ({ result: 'ok' } as NzModalRef));
                }
              }
              return { result: 'ok' } as NzModalRef;
            }),
          },
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).overrideComponent(
      ResistanceBandsComponent,
      {
        remove: 
        { 
          imports: [
            ToastModule, NzTableModule, NzIconModule, NgStyle, ConfirmDialogModule, ButtonDirective, NzModalModule, NzButtonModule
          ] 
        }, //To resolve error: "TypeError: Cannot read properties of undefined (reading 'subscribe')", even though all dependencies were provided
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      }).compileComponents();
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
    expect(resistanceBandService.getAll).toHaveBeenCalledTimes(1);
    expect(component.resistanceBands).not.toBeNull();
  });

  it('should add resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(NzMessageService);
    component.openAddModal();

    //ACT
    component.saveNewBand();

    //ASSERT
    expect(component.newResistanceBand).not.toBeNull();
    expect(resistanceBandService.add).toHaveBeenCalledWith(<ResistanceBand>component.newResistanceBand);
    expect(messageService.create).toHaveBeenCalledWith('success', 'Resistance band added.');
    expect(resistanceBandService.getAll).toHaveBeenCalledTimes(2); //The initial call and then the refrsh after the save

  });

  it('should update resistance band', () => {

    //ARRANGE
    const band = getResistanceBandInventory()[0];
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(NzMessageService);

    //ACT
    component.saveEdit(1);

    //ASSERT
    expect(resistanceBandService.update).toHaveBeenCalledWith(band);
    expect(messageService.create)
      .toHaveBeenCalledWith('success', 'Resistance band updated.');

  });

  it('should delete resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(NzMessageService);
    const band = getResistanceBandInventory()[2];

    //ACT
    component.deleteBand(band);

    //ASSERT
    expect(resistanceBandService.deleteById).toHaveBeenCalledWith(band.publicId);
    expect(messageService.create).toHaveBeenCalledWith('success', 'Resistance band deleted.');
    expect(resistanceBandService.getAll).toHaveBeenCalledTimes(2); //The initial call and then the refresh after deletion

  });

  it('should not delete resistance band if user does not confirm', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(MessageService);
    const modalService = TestBed.inject(NzModalService);
    modalService.confirm = jasmine.createSpy('confirm').and.callFake(() => { });
    const band = new ResistanceBand();
    band.id = 5;

    //ACT
    component.deleteBand(band);

    //ASSERT
    expect(resistanceBandService.deleteById).not.toHaveBeenCalled();
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

  });

  it('should hide modal', () => {

    //ACT
    component.hideModal();

    //ASSERT
    expect(component.showAddDialog).toBeFalse();
    expect(component.modalSubmitted).toBeFalse();

  });

  it('should initialize row editing', () => {
    //Because all this method does is set a private value, we just want to make sure 
    //it doesn't throw an exception

    try {
      const band = new ResistanceBand();
      component.startEdit(1);
      expect(true).toBeTrue(); //Here only to let Karma know we have an expectation
    }
    catch {
      fail();
    }

  });

  it('should cancel row editing', () => {

    //ARRANGE
    const band = getResistanceBandInventory()[0];

    //We need to start editing a row to set this test up
    component.startEdit(1);

    //ACT
    component.cancelEdit(1);

    //ASSERT
    expect(component.resistanceBands[0].color).toEqual(band.color);
    expect(component.resistanceBands[0].maxResistanceAmount).toEqual(band.maxResistanceAmount);
    expect(component.resistanceBands[0].id).toEqual(band.id);
    expect(component.resistanceBands[0].numberAvailable).toEqual(band.numberAvailable);

  });

  /*
  it('should cancel row editing when no resistance bands exist', () => {

    //ARRANGE
    //component.resistanceBands = null;
    const band = new ResistanceBand();
    band.color = 'Blue';

    //ACT
    component.onRowEditCancel(band, 0);

    //ASSERT
    expect(component.resistanceBands.length).toBe(0);

  });
  */

  it('should add message to NzMessageService when error occurs when adding a resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    resistanceBandService.add = jasmine.createSpy('add').and.returnValue(throwError(() => new Error("Something went wrong!")));

    const messageService = TestBed.inject(NzMessageService);

    //ACT
    component.saveNewBand();

    //ASSERT
    expect(messageService.create).toHaveBeenCalledWith('error', 'Failed to add resistance band.');

  });

  it('should show message when error occurs when updating a resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    resistanceBandService.update = jasmine.createSpy('update').and.returnValue(throwError(() => new Error("Something went wrong!")));

    const messageService = TestBed.inject(NzMessageService);

    //ACT
    component.saveEdit(1);

    //ASSERT
    expect(messageService.create).toHaveBeenCalledWith('error', 'Failed to update resistance band.');

  });

});
