import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundService } from 'app/core/_services/sound/sound.service';
import { CountdownConfig, CountdownEvent, CountdownModule, CountdownStatus, CountdownTimer } from 'ngx-countdown';

import { CountdownTimerComponent } from './countdown-timer.component';

class SoundServiceMock {
  playSound = jasmine.createSpy('playSound');
}


//TODO: Need to resolve tests which are failing because ViewChild objects aren't visible
//and therefore the backing objects are null
describe('CountdownTimerComponent', () => {
  let component: CountdownTimerComponent;
  let fixture: ComponentFixture<CountdownTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CountdownModule, CountdownTimerComponent],
    providers: [
        {
            provide: SoundService,
            useClass: SoundServiceMock
        }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountdownTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should begin pre-countdown', () => {
    component.startCountdown();
    expect(component.showPreCountdown).toBeTrue();
    expect(component.countdownHasBegun).toBeFalse();
  });

  it('should start countdown on final pre-countdown event', () => {
    //ARRANGE
    const soundService = TestBed.inject(SoundService);
    const preCountdownEvent = <CountdownEvent>{ action: 'done', status: CountdownStatus.done, left: 0, text: '' };

    //ACT
    component.startCountdown();
    component.handlePreCountdownEvent(preCountdownEvent);

    //ASSERT
    expect(component.countdownHasBegun).toBe(true, "component.countdownHasBegun should be true");
    expect(component.showPreCountdown).toBe(false, "component.showPreCountdown should be false");
    expect(soundService.playSound).toHaveBeenCalledWith('../../assets/sounds/210639764.mp3');
  });

  it('should reset when activatedDateTime is supplied', () => {
    //ARRANGE
    component.secondsLeadInTime = 10;
    component.secondsToCountdown = 60;
    component.preCountdownConfig = { demand: false, leftTime: 0, format: 'mm:ss' };
    component.countdownConfig = component.preCountdownConfig;

    //ACT
    component.activatedDateTime = new Date();

    //ASSERT
    expect(component.preCountdownConfig).toEqual({ demand: true, leftTime: component.secondsLeadInTime, format: 'mm:ss' });
    expect(component.countdownConfig).toEqual({ demand: true, leftTime: component.secondsToCountdown, format: 'mm:ss' });
  });

  it('should play sound when countdown is complete', () => {
    //ARRANGE
    const soundService = TestBed.inject(SoundService);
    const preCountdownEvent = <CountdownEvent>{ action: 'done', status: CountdownStatus.done, left: 0, text: '' };
    const countdownEvent = <CountdownEvent>{ action: 'done', status: CountdownStatus.done, left: 0, text: '' };

    //ACT
    component.startCountdown();
    component.handlePreCountdownEvent(preCountdownEvent);
    component.handleCountdownEvent(countdownEvent);

    //ASSERT
    expect(component.countdownHasBegun).toBe(true, "component.countdownHasBegun should be true");
    expect(component.showPreCountdown).toBe(false, "component.showPreCountdown should be false");
    expect(soundService.playSound).toHaveBeenCalledWith('../../assets/sounds/210639764.mp3');
  });
});
