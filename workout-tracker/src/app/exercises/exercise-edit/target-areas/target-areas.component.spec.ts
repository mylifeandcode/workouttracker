import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetAreasComponent } from './target-areas.component';

describe('TargetAreasComponent', () => {
  let component: TargetAreasComponent;
  let fixture: ComponentFixture<TargetAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetAreasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
