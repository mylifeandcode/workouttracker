import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { IRepSettingsForm, UserRepSettingsComponent } from './user-rep-settings.component';

describe('UserRepSettingsComponent', () => {
  let component: UserRepSettingsComponent;
  let fixture: ComponentFixture<UserRepSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRepSettingsComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRepSettingsComponent);
    component = fixture.componentInstance;

    const formBuilder = new FormBuilder();
    component.repSettingsFormGroup = formBuilder.group<IRepSettingsForm>({
      repSettingsId: new FormControl<number>(1, { nonNullable: true}), 
      setType: new FormControl<number>(1, { nonNullable: true }), 
      duration: new FormControl<number | null>(null), 
      minReps: new FormControl<number>(6, { nonNullable: true }), 
      maxReps: new FormControl<number>(10, { nonNullable: true })
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
