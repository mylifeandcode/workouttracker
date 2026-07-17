import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationComponent } from './duration.component';

describe('DurationComponent', () => {
    let component: DurationComponent;
    let fixture: ComponentFixture<DurationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DurationComponent],
            providers: [provideZonelessChangeDetection()]
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

    it('should convert current duration to hours, minutes, and seconds', async () => {
        //ARRANGE / ACT
        //The model is a linkedSignal off currentDuration, so setting the input resets the fields.
        fixture.componentRef.setInput('currentDuration', 3805);
        fixture.detectChanges();
        await fixture.whenStable();

        //ASSERT
        expect(component.form.hours().value()).toBe(1);
        expect(component.form.minutes().value()).toBe(3);
        expect(component.form.seconds().value()).toBe(25);
    });

    it('should emit hours, minutes, and seconds converted to total seconds on OK', () => {
        //ARRANGE
        vi.spyOn(component.okClicked, 'emit');
        component.form.hours().value.set(1);
        component.form.minutes().value.set(3);
        component.form.seconds().value.set(25);

        //ACT
        component.ok();

        //ASSERT
        expect(component.okClicked.emit).toHaveBeenCalledWith(3805);
    });

    it('should be invalid when minutes exceed 59', () => {
        //ARRANGE — start from a valid state (hours/minutes/seconds all 0)
        expect(component.form().invalid()).toBe(false);

        //ACT / ASSERT — minutes over 59
        component.form.minutes().value.set(60);
        expect(component.form().invalid()).toBe(true);
    });

    it('should be invalid when seconds exceed 59', () => {
        //ARRANGE — start from a valid state (hours/minutes/seconds all 0)
        expect(component.form().invalid()).toBe(false);

        //ACT / ASSERT — seconds over 59
        component.form.seconds().value.set(60);
        expect(component.form().invalid()).toBe(true);
    });

    it('should emit cancel event when cancelling', () => {
        //ARRANGE
        vi.spyOn(component.cancelClicked, 'emit');

        //ACT
        component.cancel();

        //ASSERT
        expect(component.cancelClicked.emit).toHaveBeenCalled();
    });
});
