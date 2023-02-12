import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickListComponentMock } from 'app/testing/component-mocks/primeNg/p-pick-list-mock';

import { ResistanceBandSelectComponent } from './resistance-band-select.component';

describe('ResistanceBandSelectComponent', () => {
  let component: ResistanceBandSelectComponent;
  let fixture: ComponentFixture<ResistanceBandSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        ResistanceBandSelectComponent, 
        PickListComponentMock
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
