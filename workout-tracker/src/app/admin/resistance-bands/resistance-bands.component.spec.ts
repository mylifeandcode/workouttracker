import { HttpResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResistanceBandDTO } from '../../api';
import { of, throwError } from 'rxjs';
import { ResistanceBandService } from '../../shared/services/resistance-band.service';

import { ResistanceBandsComponent } from './resistance-bands.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ModalOptions, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { type Mocked } from 'vitest';

const getResistanceBandInventory = (): Array<ResistanceBandDTO> => {
  const bands = new Array<ResistanceBandDTO>();
  bands.push(<ResistanceBandDTO>{ publicId: 'someGuid1', color: 'Blue', maxResistanceAmount: 26, numberAvailable: 2, id: 1 });
  bands.push(<ResistanceBandDTO>{ publicId: 'someGuid2', color: 'Orange', maxResistanceAmount: 60, numberAvailable: 4, id: 2 });
  bands.push(<ResistanceBandDTO>{ publicId: 'someGuid3', color: 'Yellow', maxResistanceAmount: 6, numberAvailable: 2, id: 3 });
  bands.push(<ResistanceBandDTO>{ publicId: 'someGuid4', color: 'Onlyx', maxResistanceAmount: 80, numberAvailable: 5, id: 4 });
  return bands;
};

describe('ResistanceBandsComponent', () => {
  let component: ResistanceBandsComponent;
  let fixture: ComponentFixture<ResistanceBandsComponent>;

  const resistanceBandServiceMock: Mocked<Pick<ResistanceBandService, 'getAll' | 'add' | 'update' | 'delete'>> = {
    getAll: vi.fn<ResistanceBandService['getAll']>(() => of(getResistanceBandInventory())).mockName('getAll'),
    add: vi.fn<ResistanceBandService['add']>(() => of(<ResistanceBandDTO>{})).mockName('add'),
    update: vi.fn<ResistanceBandService['update']>(() => of(<ResistanceBandDTO>{})).mockName('update'),
    delete: vi.fn<ResistanceBandService['delete']>(() => of(new HttpResponse<void>())).mockName('delete')
  };
  const messageServiceMock: Mocked<Pick<NzMessageService, 'create'>> = {
    create: vi.fn<NzMessageService['create']>().mockName('create')
  };
  //NzModalService.confirm is a generic method, which Mocked<Pick<...>> can't represent, so this mock pins a non-generic signature instead.
  const modalServiceMock = {
    confirm: vi.fn<(options?: ModalOptions<unknown>) => NzModalRef>((options) => {
      // Simulate the user clicking "OK"
      const onOk = options?.nzOnOk;
      if (onOk && !(onOk instanceof EventEmitter)) {
        onOk(<never>{});
      }
      return <NzModalRef>{};
    }).mockName('confirm')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResistanceBandsComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ResistanceBandService,
          useValue: resistanceBandServiceMock
        },
        {
          provide: NzMessageService,
          useValue: messageServiceMock
        },
        {
          provide: NzModalService,
          useValue: modalServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).overrideComponent(ResistanceBandsComponent, {
      remove: {
        imports: [
          NzIconModule, NzModalModule, NzButtonModule
        ]
      },
      add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResistanceBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize signals with default values', () => {
    expect(component.busy()).toBe(false);
    expect(component.busyMsg()).toBeUndefined();
    expect(component.showAddDialog()).toBe(false);
    expect(component.modalSubmitted()).toBe(false);
  });

  it('should get resistance band data on init', () => {
    expect(resistanceBandServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(component.resistanceBands).not.toBeNull();
  });

  it('should add resistance band', () => {

    //ARRANGE
    component.openAddModal();

    //ACT
    component.saveNewBand();

    //ASSERT
    expect(component.newResistanceBand).not.toBeNull();
    expect(resistanceBandServiceMock.add).toHaveBeenCalledWith(<ResistanceBandDTO>component.newResistanceBand);
    expect(messageServiceMock.create).toHaveBeenCalledWith('success', 'Resistance band added.');
    expect(resistanceBandServiceMock.getAll).toHaveBeenCalledTimes(2); //The initial call and then the refrsh after the save

  });

  it('should update resistance band', () => {

    //ARRANGE
    const band = getResistanceBandInventory()[0];

    //ACT
    component.saveEdit(1);

    //ASSERT
    expect(resistanceBandServiceMock.update).toHaveBeenCalledWith(band);
    expect(messageServiceMock.create)
      .toHaveBeenCalledWith('success', 'Resistance band updated.');

  });

  it('should delete resistance band', () => {

    //ARRANGE
    const band = getResistanceBandInventory()[2];

    //ACT
    component.deleteBand(band);

    //ASSERT
    expect(resistanceBandServiceMock.delete).toHaveBeenCalledWith(band.id);
    expect(messageServiceMock.create).toHaveBeenCalledWith('success', 'Resistance band deleted.');
    expect(resistanceBandServiceMock.getAll).toHaveBeenCalledTimes(2); //The initial call and then the refresh after deletion

  });

  it('should not delete resistance band if user does not confirm', () => {

    //ARRANGE
    modalServiceMock.confirm.mockReturnValue(<NzModalRef>{}); //Simulate user not confirming (nzOnOk is never invoked)
    const band = <ResistanceBandDTO>{};
    band.id = 5;

    //ACT
    component.deleteBand(band);

    //ASSERT
    expect(resistanceBandServiceMock.delete).not.toHaveBeenCalled();
    expect(resistanceBandServiceMock.getAll).toHaveBeenCalledTimes(1); //Just the initial call
    expect(messageServiceMock.create).not.toHaveBeenCalled();
  });

  it('should open modal', () => {
    //ACT
    component.openAddModal();

    //ASSERT
    expect(component.newResistanceBand).not.toBeNull();
    expect(component.modalSubmitted()).toBe(false);
    expect(component.showAddDialog()).toBe(true);
  });

  it('should hide modal', () => {
    //ACT
    component.hideModal();

    //ASSERT
    expect(component.showAddDialog()).toBe(false);
    expect(component.modalSubmitted()).toBe(false);
  });

  it('should initialize row editing', () => {
    //Because all this method does is set a private value, we just want to make sure 
    //it doesn't throw an exception

    try {
      //const band = new ResistanceBand();
      component.startEdit(1);
      expect(true).toBe(true); //Here only to let Karma know we have an expectation
    }
    catch {
      throw new Error();
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
    expect(component.resistanceBands()[0].color).toEqual(band.color);
    expect(component.resistanceBands()[0].maxResistanceAmount).toEqual(band.maxResistanceAmount);
    expect(component.resistanceBands()[0].id).toEqual(band.id);
    expect(component.resistanceBands()[0].numberAvailable).toEqual(band.numberAvailable);

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
    resistanceBandServiceMock.add.mockReturnValue(throwError(() => new Error("Something went wrong!")));

    //ACT
    component.saveNewBand();

    //ASSERT
    expect(messageServiceMock.create).toHaveBeenCalledWith('error', 'Failed to add resistance band.');

  });

  it('should show message when error occurs when updating a resistance band', () => {

    //ARRANGE
    resistanceBandServiceMock.update.mockReturnValue(throwError(() => new Error("Something went wrong!")));

    //ACT
    component.saveEdit(1);

    //ASSERT
    expect(messageServiceMock.create).toHaveBeenCalledWith('error', 'Failed to update resistance band.');

  });

  it('should sort column by color', () => {
    //ARRANGE
    const bands = getResistanceBandInventory();
    const bandA = bands[2]; //Yellow
    const bandB = bands[3]; //Onyx

    //ACT
    const result = component.sortColumnByColor(bandA, bandB);

    //ASSERT
    expect(result).toBe(1); //Y > O
  });

  it('should sort column by max resistance amount', () => {
    //ARRANGE
    const bands = getResistanceBandInventory();
    const bandA = bands[1]; //60
    const bandB = bands[2]; //6

    //ACT
    const result = component.sortColumnByMaxResistance(bandA, bandB);

    //ASSERT
    expect(result).toBe(54);
  });

  it('should sort column by number available', () => {
    //ARRANGE
    const bands = getResistanceBandInventory();
    const bandA = bands[0]; //2
    const bandB = bands[3]; //5

    //ACT
    const result = component.sortColumnByNumberAvailable(bandA, bandB);

    //ASSERT
    expect(result).toBe(-3);
  });
});
