import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResistanceBandSelectComponent } from './resistance-band-select.component';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { PickListMoveToTargetEvent } from 'primeng/picklist';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Pipe({
    name: 'resistanceAmount',
    standalone: true
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
    imports: [ResistanceBandSelectComponent,
        MockResistanceAmountPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
    .overrideComponent(ResistanceBandSelectComponent, {
      remove: { imports: [NzToolTipModule] },
      add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] } // This is to avoid issues with the NgStyle directive in the component template
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
    fixture.componentRef.setInput('exerciseUsesBilateralResistance', false);

    //ACT
    component.ngOnChanges({});

    //ASSERT
    expect(component.showBilateralValidationFailure).toBeFalse();
  });

  it('should show message about bilateral resistance on changes when exercise uses it', () => {
    //ARRANGE
    fixture.componentRef.setInput('exerciseUsesBilateralResistance', true);

    //ACT
    component.ngOnChanges({});

    //ASSERT
    expect(component.showBilateralValidationFailure).toBeTrue();
  });

  it('should show message about bilateral resistance when exercise uses it and user selects resistance which is not equally divisible', () => {
    //ARRANGE
    fixture.componentRef.setInput('exerciseUsesBilateralResistance', true);
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
    fixture.componentRef.setInput('exerciseUsesBilateralResistance', true);
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
