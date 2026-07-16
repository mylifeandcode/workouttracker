import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { form, FieldTree } from '@angular/forms/signals';

import { IUserRepSettingsModel, UserRepSettingsComponent } from './user-rep-settings.component';

describe('UserRepSettingsComponent', () => {
  let component: UserRepSettingsComponent;
  let fixture: ComponentFixture<UserRepSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRepSettingsComponent],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserRepSettingsComponent);
    component = fixture.componentInstance;

    const model = signal<IUserRepSettingsModel>({
      repSettingsId: 1,
      setType: 1,
      duration: null,
      minReps: 6,
      maxReps: 10
    });
    const field: FieldTree<IUserRepSettingsModel> = TestBed.runInInjectionContext(() => form(model));
    fixture.componentRef.setInput('field', field);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
