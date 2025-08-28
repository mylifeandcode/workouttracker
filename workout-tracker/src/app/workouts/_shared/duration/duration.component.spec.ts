import { SimpleChange, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { DurationComponent } from './duration.component';

describe('DurationComponent', () => {
  let component: DurationComponent;
  let fixture: ComponentFixture<DurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
  imports: [ReactiveFormsModule, DurationComponent],
  providers: [FormBuilder, provideZonelessChangeDetection()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert current duration to hours, minutes, and seconds', () => {
    //TODO: Find a better approach to this

    //ARRANGE
    fixture.componentRef.setInput('currentDuration', 3805); //When set programmatically, does not trigger ngOnChanges()
  // We'll use this to call ngOnChanges(), but since the change lifecycle isn't occurring,
  // the line above is still needed. Yeah, this is kinda kludgey.
  const change = new SimpleChange(0, 3805, true);

    //ACT
    //fixture.detectChanges(); 
    //NOPE! This won't pick up that we've changed currentDuration programmatically.
    //We could create a host component, but that's overkill for this scenario.
    component.ngOnChanges({currentDuration: change});

    //ASSERT
    expect(component.form.controls.hours.value).toBe(1);
    expect(component.form.controls.minutes.value).toBe(3);
    expect(component.form.controls.seconds.value).toBe(25);
  });

  it('should emit hours, minutes, and seconds converted to total seconds on OK', () => {
    //ARRANGE
    spyOn(component.okClicked, 'emit');
    component.form.controls.hours.setValue(1);
    component.form.controls.minutes.setValue(3);
    component.form.controls.seconds.setValue(25);

    //ACT
    component.ok();

    //ASSERT
    expect(component.okClicked.emit).toHaveBeenCalledWith(3805);
  });

  it('should emit cancel event when cancelling', () => {
    //ARRANGE
    spyOn(component.cancelClicked, 'emit');

    //ACT
    component.cancel();

    //ASSERT
    expect(component.cancelClicked.emit).toHaveBeenCalled();
  });
});
