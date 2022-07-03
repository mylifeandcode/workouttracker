import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { SoundService } from 'app/core/sound.service';

@Component({
  selector: 'wt-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.css']
})
export class CountdownTimerComponent implements OnInit {

  @ViewChild('preCountdown', { static: false }) private _preCountdown: CountdownComponent;
  @ViewChild('mainCountdown', { static: false }) private _countdown: CountdownComponent;

  public countdownConfig: CountdownConfig = this.getCountdownConfig(0);
  public preCountdownConfig: CountdownConfig = this.getCountdownConfig(0);
  public showPreCountdown: boolean = false;
  public countdownHasBegun: boolean = false;

  private _preCountdownHasBegun: boolean = false;

  @Input()
  public set secondsToCountdown(value: number) {
    this._secondsToCountdown = value;
    //this.reset();
  }
  public get secondsToCountdown(): number {
    return this._secondsToCountdown;
  }

  @Input()
  public set secondsLeadInTime(value: number) {
    this._secondsLeadInTime = value;
  }
  public get secondsLeadInTime(): number {
    return this._secondsLeadInTime;
  }

  @Input()
  public set activatedDateTime(value: Date) {
    this.reset();
  }

  @Input()
  public targetReps: number | null;

  private _secondsToCountdown: number;
  private _secondsLeadInTime: number;

  constructor(private _soundService: SoundService) { 
  }

  public ngOnInit(): void {
  }

  public startCountdown(): void {
    this.showPreCountdown = true;
    this._preCountdownHasBegun = true;
    this._preCountdown.begin();
  }

  //TODO: Add ability to pause

  public handlePreCountdownEvent(countdownEvent: CountdownEvent): void {
    if(this._preCountdownHasBegun && countdownEvent.action == 'done') {
      this.showPreCountdown = false; 
      this.playSound();
      this.countdownHasBegun = true;
      this._countdown.begin();
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
