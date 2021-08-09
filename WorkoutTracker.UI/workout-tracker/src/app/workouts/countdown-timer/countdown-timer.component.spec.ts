import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundService } from 'app/core/sound.service';
import { CountdownEvent } from 'ngx-countdown';

import { CountdownTimerComponent } from './countdown-timer.component';

class SoundServiceMock {
  playSound = jasmine.createSpy('playSound');
}

//TODO: Need to resolve tests which are failing because ViewChild objects aren't visible
//and therefore the backing objects are null
xdescribe('CountdownTimerComponent', () => {
  let component: CountdownTimerComponent;
  let fixture: ComponentFixture<CountdownTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountdownTimerComponent ],
      providers: [
        {
          provide: SoundService,
          useClass: SoundServiceMock
        }
      ]
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

  it('should being pre-countdown', () => {
    component.startCountdown();
    expect(component.showPreCountdown).toBeTrue();
    expect(component.countdownHasBegun).toBeFalse();
  });

  it('should start countdown on final pre-countdown event', () => {
    //ARRANGE
    const soundService = TestBed.inject(SoundService);
    const preCountdownEvent = <CountdownEvent>{ action: 'done', status: null, left: null, text: null };

    //ACT
    component.handlePreCountdownEvent(preCountdownEvent);

    //ASSERT
    expect(component.countdownHasBegun).toBeTrue();
    expect(component.showPreCountdown).toBeTrue();
    expect(soundService.playSound).toHaveBeenCalledWith('../../assets/sounds/210639764.mp3');
  });
});
