import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickActionsComponent } from './quick-actions.component';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('QuickActionsComponent', () => {
  let component: QuickActionsComponent;
  let fixture: ComponentFixture<QuickActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickActionsComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([])
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
