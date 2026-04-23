import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SoundService } from '../../core/_services/sound/sound.service';
import { CountdownTimerComponent } from '../../workouts/workout/countdown-timer/countdown-timer.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@Component({
  selector: 'wt-system',
  templateUrl: './system.component.html',
  imports: [NzSpinModule, NzModalModule, CountdownTimerComponent, NzSelectModule, FormsModule, NzCheckboxModule],
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

  options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
    { label: 'Option D', value: 'd' },
    { label: 'Option E', value: 'e' },
    { label: 'Option F', value: 'f' },
  ];

  selectedValues: string[] = [];

  get isAllSelected(): boolean {
    return this.selectedValues.length === this.options.length;
  }

  get isIndeterminate(): boolean {
    return this.selectedValues.length > 0 && !this.isAllSelected;
  }

  toggleAll(checked: boolean): void {
    this.selectedValues = checked ? this.options.map(o => o.value) : [];
  }  

}
