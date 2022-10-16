import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRepSettingsComponent } from './user-rep-settings.component';

describe('UserRepSettingsComponent', () => {
  let component: UserRepSettingsComponent;
  let fixture: ComponentFixture<UserRepSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRepSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRepSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
