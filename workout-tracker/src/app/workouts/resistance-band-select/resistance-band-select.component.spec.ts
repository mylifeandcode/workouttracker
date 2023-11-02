import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickListComponentMock } from 'app/testing/component-mocks/primeNg/p-pick-list-mock';

import { ResistanceBandSelectComponent } from './resistance-band-select.component';
import { Pipe, PipeTransform } from '@angular/core';

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
});
