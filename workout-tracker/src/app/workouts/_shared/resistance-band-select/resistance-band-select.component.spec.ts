import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ResistanceBandSelectComponent } from './resistance-band-select.component';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform, SimpleChange } from '@angular/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTransferModule, TransferItem } from 'ng-zorro-antd/transfer';
import { ResistanceAmountPipe } from '../../../workouts/_pipes/resistance-amount.pipe';
import { ResistanceBandColorPipe } from '../../../shared/pipes/resistance-band-color.pipe';
import { ResistanceBandIndividual } from '../../../shared/models/resistance-band-individual';

@Pipe({
    name: 'resistanceAmount',
    standalone: true
})
export class MockResistanceAmountPipe implements PipeTransform {
    transform(): string {
        return 'Fake Resistance Amount';
    }
}

const bandInventory: ResistanceBandIndividual[] = [
    { color: 'Red', maxResistanceAmount: 8 },
    { color: 'Red', maxResistanceAmount: 8 },
    { color: 'Blue', maxResistanceAmount: 13 },
    { color: 'Orange', maxResistanceAmount: 30 },
];

describe('ResistanceBandSelectComponent', () => {
    let component: ResistanceBandSelectComponent;
    let fixture: ComponentFixture<ResistanceBandSelectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ResistanceBandSelectComponent],
            providers: [provideZonelessChangeDetection()]
        })
            .overrideComponent(ResistanceBandSelectComponent, {
            remove: {
                imports: [NzTransferModule, NzToolTipModule, ResistanceAmountPipe, ResistanceBandColorPipe]
            },
            add: {
                imports: [MockResistanceAmountPipe],
                schemas: [CUSTOM_ELEMENTS_SCHEMA]
            }
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ResistanceBandSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        fixture.componentRef.setInput('resistanceBandInventory', bandInventory);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not show message about bilateral resistance when exercise does not use it', () => {
        //ARRANGE
        fixture.componentRef.setInput('exerciseUsesBilateralResistance', false);
        const change = new SimpleChange(null, {
            selectedBandsDelimited: 'Red,Blue',
            doubleMaxResistanceAmounts: false
        }, true);

        //ACT
        component.ngOnChanges({ 'bandAllocation': change });

        //ASSERT
        expect(component.showBilateralValidationFailure).toBe(false);
    });

    it('should show message about bilateral resistance on changes when exercise uses it', () => {
        //ARRANGE
        fixture.componentRef.setInput('exerciseUsesBilateralResistance', true);
        const change = new SimpleChange(null, {
            selectedBandsDelimited: 'Red,Blue',
            doubleMaxResistanceAmounts: false
        }, true);

        //ACT
        component.ngOnChanges({ 'bandAllocation': change });

        //ASSERT
        expect(component.showBilateralValidationFailure).toBe(true);
    });

    it('should show message about bilateral resistance when exercise uses it and user selects resistance which is not equally divisible', () => {
        //ARRANGE
        fixture.componentRef.setInput('exerciseUsesBilateralResistance', true);

        const band: TransferItem = {
            key: `S1`,
            title: 'Red',
            direction: 'right',
            disabled: false,
            checked: false
        };

        component.transferItems.push(band);

        //ACT
        component.onTransferChange();

        //ASSERT
        expect(component.showBilateralValidationFailure).toBe(true);
    });

    it('should show message about bilateral resistance when exercise uses it and user selects just one band', () => {
        //ARRANGE
        fixture.componentRef.setInput('exerciseUsesBilateralResistance', true);
        const band1: TransferItem = {
            key: `S1`,
            title: 'Red',
            direction: 'left',
            disabled: false,
            checked: false
        };

        const band2: TransferItem = {
            key: `S2`,
            title: 'Red',
            direction: 'right',
            disabled: false,
            checked: false
        };

        component.transferItems.push(...[band1, band2]);

        //ACT
        component.onTransferChange();

        //ASSERT
        expect(component.showBilateralValidationFailure).toBe(true);
    });

    it('should not show message about bilateral resistance when exercise uses it and user selects resistance which is equally divisible', () => {
        //ARRANGE
        fixture.componentRef.setInput('exerciseUsesBilateralResistance', true);
        const band1: TransferItem = {
            key: `S1`,
            title: 'Red',
            direction: 'right',
            disabled: false,
            checked: false
        };

        const band2: TransferItem = {
            key: `S2`,
            title: 'Red',
            direction: 'right',
            disabled: false,
            checked: false
        };

        const band3: TransferItem = {
            key: `S3`,
            title: 'Blue',
            direction: 'left',
            disabled: false,
            checked: false
        };

        const band4: TransferItem = {
            key: `S4`,
            title: 'Orange',
            direction: 'left',
            disabled: false,
            checked: false
        };

        component.transferItems.push(...[band1, band2, band3, band4]);

        //ACT
        component.onTransferChange();

        //ASSERT
        expect(component.showBilateralValidationFailure).toBe(false);
    });
});
