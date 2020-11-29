import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResistanceBandsComponent } from './resistance-bands.component';

describe('ResistanceBandsComponent', () => {
  let component: ResistanceBandsComponent;
  let fixture: ComponentFixture<ResistanceBandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResistanceBandsComponent ]
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
