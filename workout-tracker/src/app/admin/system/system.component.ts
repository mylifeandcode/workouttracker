import { Component, inject } from '@angular/core';
import { SoundService } from 'app/core/_services/sound/sound.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'wt-system',
    templateUrl: './system.component.html',
    styleUrls: ['./system.component.scss'],
    imports: [ToastModule]
})
export class SystemComponent {
  private _soundService = inject(SoundService);
  private _messageService = inject(MessageService);


  public testSoundService(): void {
    this._soundService.playSound('../../assets/sounds/210639764.mp3');
  }

  public testToast(): void {
    this._messageService.add({ severity: 'success', summary: 'Successful', detail: 'Toasty!', life: 3000 });
  }

}
