import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';

@Component({
  selector: 'wt-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.css']
})
export class CountdownTimerComponent implements OnInit {

  @ViewChild('preCountdown', { static: false }) private _preCountdown: CountdownComponent;
  @ViewChild('mainCountdown', { static: false }) private _countdown: CountdownComponent;

  public countdownConfig: CountdownConfig;
  public preCountdownConfig: CountdownConfig;
  public showPreCountdown: boolean = false;
  public countdownHasBegun: boolean = false;

  @Input()
  public get secondsToCountdown(): number {
    return this._secondsToCountdown;
  }
  public set secondsToCountdown(value: number) {
    this._secondsToCountdown = value;
    this.setCountdownConfig();
    this.reset();
  }

  @Input()
  public get secondsLeadInTime(): number {
    return this._secondsLeadInTime;
  }
  public set secondsLeadInTime(value: number) {
    this._secondsLeadInTime = value;
    this.setPreCountdownConfig();
  }

  private _secondsToCountdown: number;
  private _secondsLeadInTime: number;

  constructor() { 
  }

  ngOnInit(): void {
  }

  public startCountdown(): void {
    this.showPreCountdown = true;
    this._preCountdown.begin();
  }

  public handlePreCountdownEvent(countdownEvent: CountdownEvent): void {
    if(countdownEvent.action == 'done') {
      this.showPreCountdown = false;
      //TODO: Make a sound -- more info here: https://www.geeksforgeeks.org/how-to-make-a-beep-sound-in-javascript/
      this.countdownHasBegun = true;
      this._countdown.begin();
    }
  }

  public handleCountdownEvent(countdownEvent: CountdownEvent): void {
    if(countdownEvent.action == 'done') {
      //TODO: Make a sound -- more info here: https://www.geeksforgeeks.org/how-to-make-a-beep-sound-in-javascript/
    }
  }

  private setPreCountdownConfig(): void {
    this.preCountdownConfig = this.getCountdownConfig(this._secondsLeadInTime);
  }

  private setCountdownConfig(): void {
    this.countdownConfig = this.getCountdownConfig(this._secondsToCountdown);
  }

  private getCountdownConfig(leftTime: number): CountdownConfig {

    return { 
      demand: true, 
      leftTime: leftTime, 
      format: 'mm:ss' 
    };

  }

  private reset(): void {
    this.showPreCountdown = false;
    this.countdownHasBegun = false;
  }

}