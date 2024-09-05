import { Component, OnInit } from '@angular/core';
import { SoundService } from 'app/core/services/sound/sound.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'wt-system',
    templateUrl: './system.component.html',
    styleUrls: ['./system.component.scss'],
    standalone: true,
    imports: [ToastModule]
})
export class SystemComponent {

  constructor(
    private _soundService: SoundService,
    private _messageService: MessageService) { 
      
    }

  public testSoundService(): void {
    this._soundService.playSound('../../assets/sounds/210639764.mp3');
  }

  public testToast(): void {
    this._messageService.add({ severity: 'success', summary: 'Successful', detail: 'Toasty!', life: 3000 });
  }

}
