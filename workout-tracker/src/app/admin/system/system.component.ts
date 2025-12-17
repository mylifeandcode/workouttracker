import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SoundService } from '../../core/_services/sound/sound.service';
import { CountdownTimerComponent } from '../../workouts/workout/countdown-timer/countdown-timer.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'wt-system',
  templateUrl: './system.component.html',
  imports: [NzSpinModule, NzModalModule, CountdownTimerComponent],
  styleUrls: ['./system.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemComponent {
  private readonly _soundService = inject(SoundService);
  private readonly _messageService = inject(NzMessageService);

  showCountdownModal = signal<boolean>(false);
  countdownModalActivatedDateTime = signal<Date | null>(null);

  public testSoundService(): void {
    this._soundService.playSound('../../assets/sounds/210639764.mp3');
  }

  public testToast(): void {
    //this._messageService.add({ severity: 'success', summary: 'Successful', detail: 'Toasty!', life: 3000 });
    this._messageService.success('Successful', { nzDuration: 3000 });
  }

  public testCountdown(): void {
    this.countdownModalActivatedDateTime.set(new Date());
    this.showCountdownModal.set(true);
  }

}
