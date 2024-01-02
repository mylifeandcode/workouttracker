import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickListComponentMock } from 'app/testing/component-mocks/primeNg/p-pick-list-mock';

import { ResistanceBandSelectComponent } from './resistance-band-select.component';
import { Pipe, PipeTransform } from '@angular/core';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { PickListMoveToTargetEvent } from 'primeng/picklist';

@Pipe({
  name: 'resistanceAmount'
})
export class MockResistanceAmountPipe implements PipeTransform {
  transform(value: number | null): string {
    return 'Fake Resistance Amount';
  }
}

describe('ResistanceBandSelectComponent', () => {
  let component: ResistanceBandSelectComponent;
  let fixture: ComponentFixture<ResistanceBandSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        ResistanceBandSelectComponent, 
        PickListComponentMock,
        MockResistanceAmountPipe
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResistanceBandSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show message about bilateral resistance when exercise does not use it', () => {
    //ARRANGE
    component.exerciseUsesBilateralResistance = false;

    //ACT
    component.ngOnChanges({});

    //ASSERT
    expect(component.showBilateralValidationFailure).toBeFalse();
  });

  it('should show message about bilateral resistance on changes when exercise uses it', () => {
    //ARRANGE
    component.exerciseUsesBilateralResistance = true;

    //ACT
    component.ngOnChanges({});

    //ASSERT
    expect(component.showBilateralValidationFailure).toBeTrue();
  });

  it('should show message about bilateral resistance when exercise uses it and user selects resistance which is not equally divisible', () => {
    //ARRANGE
    component.exerciseUsesBilateralResistance = true;
    const selectedBands = [];
    selectedBands.push(new ResistanceBandIndividual('Red', 8));
    component.selectedBands.push(new ResistanceBandIndividual('Red', 8)); //This gets set when the selection occurs in the UI

    //ACT
    component.bandSelected(<PickListMoveToTargetEvent>{ items: selectedBands });

    //ASSERT
    expect(component.showBilateralValidationFailure).toBeTrue();
  });

  it('should not show message about bilateral resistance when exercise uses it and user selects resistance which is equally divisible', () => {
    //ARRANGE
    component.exerciseUsesBilateralResistance = true;
    const selectedBands = [];
    selectedBands.push(new ResistanceBandIndividual('Red', 8));
    component.selectedBands.push(new ResistanceBandIndividual('Red', 8)); //Previously selected band
    component.selectedBands.push(new ResistanceBandIndividual('Red', 8)); //This occurs via the PrimeNG component when the band is selected

    //ACT
    component.bandSelected(<PickListMoveToTargetEvent>{ items: selectedBands });

    //ASSERT
    expect(component.showBilateralValidationFailure).toBeFalse();
  });  
});
