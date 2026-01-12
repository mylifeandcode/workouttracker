import { Component, ViewChild, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { SoundService } from '../../../core/_services/sound/sound.service';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'wt-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss'],
  imports: [NgStyle, CountdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountdownTimerComponent {
  private _soundService = inject(SoundService);

  @ViewChild('preCountdown', { static: false }) private _preCountdown: CountdownComponent | undefined;
  @ViewChild('mainCountdown', { static: false }) private _countdown: CountdownComponent | undefined;

  public countdownConfig: CountdownConfig = this.getCountdownConfig(0);
  public preCountdownConfig: CountdownConfig = this.getCountdownConfig(0);
  public showPreCountdown = signal(false);
  public countdownHasBegun = signal(false);

  private _preCountdownHasBegun = signal(false);

  readonly secondsToCountdown = input<number>(0);
  readonly secondsLeadInTime = input<number>(0);
  activatedDateTime = input<Date | null>(null);
  public readonly targetReps = input<number | null>(null);
  
  constructor() {
    effect(() => {
      if (this.activatedDateTime()) {
        this.reset();
      }
    });
  }
  
  public startCountdown(): void {
    this.showPreCountdown.set(true);
    this._preCountdownHasBegun.set(true);
    this._preCountdown?.begin();
  }

  //TODO: Add ability to pause

  public handlePreCountdownEvent(countdownEvent: CountdownEvent): void {
    if (this._preCountdownHasBegun() && countdownEvent.action == 'done') {
      this.showPreCountdown.set(false);
      this.playSound();
      this.countdownHasBegun.set(true);
      this._countdown?.begin();
    }
  }

  public handleCountdownEvent(countdownEvent: CountdownEvent): void {
    if (this.countdownHasBegun()) { //If statement added because the 'done' event was firing on init, before countdown even began
      if (countdownEvent.action == 'done') {
        this.playSound();
      }
    }
  }

  private setPreCountdownConfig(): void {
    this.preCountdownConfig = this.getCountdownConfig(this.secondsLeadInTime());
  }

  private setCountdownConfig(): void {
    this.countdownConfig = this.getCountdownConfig(this.secondsToCountdown());
  }

  private getCountdownConfig(leftTime: number): CountdownConfig {

    return {
      demand: true,
      leftTime: leftTime,
      format: 'mm:ss'
    };

  }

  private reset(): void {
    if (this.secondsToCountdown()) {
      this.setPreCountdownConfig();
      this.setCountdownConfig();
      this.showPreCountdown.set(false);
      this.countdownHasBegun.set(false);
      this._preCountdownHasBegun.set(false);
    }
  }

  private playSound(): void {
    this._soundService.playSound('../../assets/sounds/210639764.mp3');
  }
}
