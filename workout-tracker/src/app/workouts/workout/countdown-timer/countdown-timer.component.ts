import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { SoundService } from 'app/core/_services/sound/sound.service';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'wt-countdown-timer',
    templateUrl: './countdown-timer.component.html',
    styleUrls: ['./countdown-timer.component.scss'],
    standalone: true,
    imports: [NgStyle, CountdownComponent]
})
export class CountdownTimerComponent implements OnInit {

  @ViewChild('preCountdown', { static: false }) private _preCountdown: CountdownComponent | undefined;
  @ViewChild('mainCountdown', { static: false }) private _countdown: CountdownComponent | undefined;

  public countdownConfig: CountdownConfig = this.getCountdownConfig(0);
  public preCountdownConfig: CountdownConfig = this.getCountdownConfig(0);
  public showPreCountdown: boolean = false;
  public countdownHasBegun: boolean = false;

  private _preCountdownHasBegun: boolean = false;

  @Input()
  secondsToCountdown: number = 0;

  @Input()
  secondsLeadInTime: number = 0;

  //TODO: Revisit. Not sure I like this approach.
  @Input()
  public set activatedDateTime(value: Date) {
    this.reset();
  }

  @Input()
  public targetReps: number | null = null;

  constructor(private _soundService: SoundService) { 
  }

  public ngOnInit(): void {
  }

  public startCountdown(): void {
    this.showPreCountdown = true;
    this._preCountdownHasBegun = true;
    this._preCountdown?.begin();
  }

  //TODO: Add ability to pause

  public handlePreCountdownEvent(countdownEvent: CountdownEvent): void {
    if(this._preCountdownHasBegun && countdownEvent.action == 'done') {
      this.showPreCountdown = false; 
      this.playSound();
      this.countdownHasBegun = true;
      this._countdown?.begin();
    }
  }

  public handleCountdownEvent(countdownEvent: CountdownEvent): void {
    if (this.countdownHasBegun) { //If statement added because the 'done' event was firing on init, before countdown even began
      if(countdownEvent.action == 'done') {
        this.playSound(); 
      }
    }
  }

  private setPreCountdownConfig(): void {
    this.preCountdownConfig = this.getCountdownConfig(this.secondsLeadInTime);
  }

  private setCountdownConfig(): void {
    this.countdownConfig = this.getCountdownConfig(this.secondsToCountdown);
  }

  private getCountdownConfig(leftTime: number): CountdownConfig {

    return { 
      demand: true, 
      leftTime: leftTime, 
      format: 'mm:ss' 
    };

  }

  private reset(): void {
    if (this.secondsToCountdown) {
      this.setPreCountdownConfig();
      this.setCountdownConfig();
      this.showPreCountdown = false;
      this.countdownHasBegun = false;
      this._preCountdownHasBegun = false;
    }
  }

  private playSound(): void {
    this._soundService.playSound('../../assets/sounds/210639764.mp3');
  }

}
