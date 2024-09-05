import { HttpResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResistanceBand } from 'app/shared/models/resistance-band';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ResistanceBandService } from '../../shared/resistance-band.service';

import { ResistanceBandsComponent } from './resistance-bands.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).overrideComponent(
      ResistanceBandsComponent,
      {
        remove: { imports: [ToastModule, ConfirmDialogModule] }, //To resolve error: "TypeError: Cannot read properties of undefined (reading 'subscribe')", even though all dependencies were provided
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
    const messageService = TestBed.inject(MessageService);
    component.openAddModal();

    //ACT
    component.saveNewBand();

    //ASSERT
    expect(component.newResistanceBand).not.toBeNull();
    expect(resistanceBandService.add).toHaveBeenCalledWith(<ResistanceBand>component.newResistanceBand);
    expect(messageService.add)
      .toHaveBeenCalledWith({
        severity: 'success',
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
        severity: 'success',
        summary: 'Successful',
        detail: 'Resistance Band updated', life: 3000
      });

  });

  it('should delete resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    const messageService = TestBed.inject(MessageService);
    const band = new ResistanceBand();
    band.id = 5;

    //ACT
    component.deleteBand(band);

    //ASSERT
    expect(resistanceBandService.delete).toHaveBeenCalledWith(band.id);
    expect(messageService.add)
      .toHaveBeenCalledWith({
        severity: 'success',
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
    confirmationService.confirm = jasmine.createSpy('confirm').and.callFake(() => { });
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
      component.onRowEditInit(band);
      expect(true).toBeTrue(); //Here only to let Karma know we have an expectation
    }
    catch {
      fail();
    }

  });

  it('should cancel row editing', () => {

    //ARRANGE
    const band = new ResistanceBand();
    band.color = 'Red';
    band.maxResistanceAmount = 16;
    band.id = 1;
    band.numberAvailable = 1;

    //We need to start editing a row to set this test up
    component.onRowEditInit(band);

    //ACT
    component.onRowEditCancel(band, 0);

    //ASSERT
    //Why the wacky comparison logic below? Because the clone bands are not an array, but 
    //an object with an indexer and ResistanceBand-type property. This code should be revisited.
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

  it('should add message to MessageService when error occurs when adding a resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    resistanceBandService.add = jasmine.createSpy('add').and.returnValue(throwError(() => new Error("Something went wrong!")));

    const messageService = TestBed.inject(MessageService);

    //ACT
    component.saveNewBand();

    //ASSERT
    expect(messageService.add).toHaveBeenCalledWith({ severity: 'error', summary: 'Error', detail: 'Failed to add Resistance Band', sticky: true });

  });

  it('should add message to MessageService when error occurs when updating a resistance band', () => {

    //ARRANGE
    const resistanceBandService = TestBed.inject(ResistanceBandService);
    resistanceBandService.update = jasmine.createSpy('update').and.returnValue(throwError(() => new Error("Something went wrong!")));

    const messageService = TestBed.inject(MessageService);

    //ACT
    component.onRowEditSave(new ResistanceBand());

    //ASSERT
    expect(messageService.add).toHaveBeenCalledWith({ severity: 'error', summary: 'Error', detail: 'Failed to update Resistance Band', sticky: true });

  });

});
